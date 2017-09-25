#!/bin/bash
# Bash Menu Script Example

# Project ID
projectId=`gcloud config get-value project 2>&1 | (tail -n1)`
echo "Initializing script for Project ID: " $projectId

# Account
accountId=`gcloud config get-value account 2>&1 | (tail -n1)`
echo "You are using $accountId account to deploy"
git config --global user.email $accountId

echo "Retrieving the Database VM Running Instance.."
#dbComputeInfo=`gcloud compute instances list  | grep -E 'applause.*RUNNING|RUNNING.*applause' | awk '{print $1 "," $4}'`
dbComputeInfo=`gcloud compute instances list  | grep -E 'applause.*RUNNING|RUNNING.*applause' | awk '{print $1 "," $4}'`
IFS=', ' read -r -a dbComputeInfoArr <<< $dbComputeInfo

if [ ${#dbComputeInfoArr[@]} -eq 0 ]
then
    echo "Error: No Applause Database VM instance is running."
    exit
fi

dbVMName=${dbComputeInfoArr[0]}
dbVMIP=${dbComputeInfoArr[1]}
echo "Running VM database instance: "$dbVMName

PS3='Please enter your choice: '
options=("Server Deploy" "Database Deployment" "Database Backup" "Database Restore" "Quit script")
select opt in "${options[@]}"
do
    case $opt in
        "Server Deploy")
            echo "You chose to deploy server."
            
            echo "Fetching latest code from Applause bitbucket repository - applause_backend_portal"
            git pull

            #Bucket names
            echo "Checking bucket name for Project: "$projectId
            bucketName=`gsutil ls -p $projectId | grep $projectId'-img' | awk -F / '{ print $(NF-1) }'`
            if [ -z "$bucketName" -a "$bucketName" != " " ]; then
                echo "Error: Bucket name cannot be resolved. Please check bucket name on Google cloud storage for this project."
                echo "The bucket name for your project should be '$projectId-img'"
                break
            fi
            
            echo "Bucket Name exists for $projectId is: "$bucketName

            #Version Name
            echo "Version Name (May only contain lowercase letters, digits, and hyphens. Must begin and end with a letter or digit. Must not exceed 63 characters):" 
            read versionName

            echo "Starting deployment..."

            sed -e "s/<host>/$dbVMIP/" -e "s/<project_id>/$projectId/" -e "s/<cloud_bucket>/$bucketName/" app.yaml.template > app.yaml
            
            #echo "Executing command: "gcloud app deploy --project $projectId --version $versionName
            gcloud app deploy --project $projectId

            if [ $? -eq 0 ];
            then
                echo "Server deployment on Google cloud platform was successful."
            else
                echo "Server deployment on Google cloud platform was unsuccessful."
            fi
            ;;
        "Database Deployment")
            echo "You chose to deploy database."
            echo "Setting up environment for database deployment."
            gcloud compute copy-files "./db_deployment.sh" $dbVMName:~/ --zone=us-central1-f
            if [ $? -eq 0 ];
            then
                gcloud compute  --project $projectId ssh $dbVMName --command="sudo sh ~/db_deployment.sh $dbVMIP"
                if [ $? -eq 0 ];
                then
                    echo "Database deployment completed successfuly."
                else
                    echo "Error: Restoring the database dump on remote database."
                fi
            else
                echo "Error: Copying database deployment script from this machine to remote instance."
            fi
            ;;
        "Database Backup")
            echo "You chose to backup database."
            
            echo "Put directory path for storing the database backup."
            echo "(Note: By default, it will be stored in current directory.)"
            read backPath
            if [ -z "$backPath" -a "$backPath" != " " ]; then
                scriptPath=`pwd -P`
                backPath=$scriptPath"/"
            fi
            
            echo "Backing database to path: "$backPath
            gcloud compute  --project $projectId ssh $dbVMName --command="sudo mongodump --db applause --username=root --password=applause123"

            if [ $? -eq 0 ];
            then
                echo "Error in backing up data from database."
            else
                gcloud compute copy-files $dbVMName:~/dump --zone=us-central1-f $backPath
                if [ $? -eq 0 ];
                then
                    echo "Database backup operation completed successfuly."
                else
                    echo "Error: Copying the database backup data from remote instance to this machine."
                fi
            fi
            ;;
        "Database Restore")
            echo "You chose to Restore database."

            echo "Please chose which database dump you want to restore: "
            dbChoice=("Custom path" "Sample database dump" "Empty database dump" "Quit Database operations")
            select choice in "${dbChoice[@]}"
            do
                case $choice in
                "Custom path")
                    echo "Please enter file absolute path: "
                    echo "For ex: /home/<userId>/<directory path to dump>."
                    echo "Or else, you can go to dump directory and execute 'pwd' command to get full path."
                    read dumpPath
                    break
                    ;;
                "Sample database dump")
                    scriptPath=`pwd -P`
                    dumpPath="$scriptPath/../docs/google_deployment/sample-db/dump"
                    break
                    ;;
                "Empty database dump")
                    scriptPath=`pwd -P`
                    dumpPath="$scriptPath/../docs/google_deployment/empty-db/dump"
                    break
                    ;;
                "Quit Database operations") 
                    break
                    ;;
                *) echo invalid DB Choice option;;
                esac
            done
            
            if [ -z "$dumpPath" -a "$dumpPath" != " " ]; 
            then
                echo "Error: Database sump path is empty. So cannot proceed with restore operations."
            else 
                echo "Restoring database from path: "$dumpPath
                gcloud compute copy-files $dumpPath $dbVMName:~/ --zone=us-central1-f
                if [ $? -eq 0 ];
                then
                    echo "Error: Copying database dump from this machine to remote instance."
                else
                    gcloud compute  --project $projectId ssh $dbVMName --command="sudo mongorestore -d applause applause-new-tables --port 27017 --username root --password applause123"
                    if [ $? -eq 0 ];
                    then
                        echo "Database restore operation completed successfuly."
                    else
                        echo "Error: Restoring the database dump on remote database."
                    fi
                fi
            fi
            ;;
        "Quit script")
            break
            ;;
        *) echo invalid Selection;;
    esac
done