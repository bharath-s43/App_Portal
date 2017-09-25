#!/bin/bash
# Bash Menu Script Example

#Hard-coded
#1. db username and password - sort out some means to do dynamically somehow

## Database deployment script for First time database deployment
# Args 1: internal server ip address for binding
serverIp=$1

#Take mongod.conf backup if not exists
cmdout=`ls /opt/bitnami/mongodb/mongodb.conf.bkp`
if [ $? -ne 0 ]; then
	sudo cp mongodb.conf mongodb.conf.bkp
fi

## Check if database user for server exists or not
cmdout=`mongo applause --username applause -p applause123 | grep 'Error: Authentication failed.'`
if [ $? -ne 0 ];then
	echo "Database pre-configured with username and password. Checking database acceptable connections configuration."
	
	# Check if configuration still holds good for the server ip as args in conf file 
	# or else replace conf file with new ip address
	cmdout=`cat /opt/bitnami/mongodb/mongodb.conf | grep $serverIp`
	if  [ $? -eq 0 ];then
		echo "Database configurations are correct and thus skipping deployment."
	else
		echo "Re-configuring database with new server internal address for listening to server requests only."
		cmdout=`sudo sed -i -r -e "s/\#?bind_ip = 127.0.0.1/\bind_ip = 127.0.0.1,$serverIp/" /opt/bitnami/mongodb/mongodb.conf`
		
		# re-starting mongodb instance for changes to take effect
		echo "Restarting Database."
		sudo /opt/bitnami/ctlscript.sh restart mongodb
	fi
else
	echo "Database user not found. Thus, configuring database with access controls."
	#Disabling db authentication
	cmdout=`sudo sed -i -r -e "s/\#?bind_ip = 127.0.0.1/\bind_ip = 127.0.0.1,$serverIp/" -e "s/\<auth = true\>/#auth = true/" /opt/bitnami/mongodb/mongodb.conf`
	echo "Binding the Database to accept connections from NodeJS server."
	
	#restarting mongo
	echo "Restarting Database."
	sudo /opt/bitnami/ctlscript.sh restart mongodb
	
	#Create applause server username and password
	sudo mongo admin --eval 'db = db.getSiblingDB("admin");db.createUser( { user: "applause", pwd: "applause123", roles: [ "readWrite", "dbAdmin" ]} )'
	echo "Created username for server. username: `applause`"

	#Again enable authentication
	cmdout=`sudo sed -i -e "s/\#auth = true/auth = true/" /opt/bitnami/mongodb/mongodb.conf`

	# re-starting mongodb instance for changes to take effect
	sudo /opt/bitnami/ctlscript.sh restart mongodb
fi

