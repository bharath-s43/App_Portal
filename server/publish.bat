@ECHO OFF

REM This script publishes the website to either dev, uat or prod depending on the argument
REM dev ==>    OR prod ==>  OR uat==>
rem
rem

REM NEED to set alreadyHasInstance=no when you publish first time 
set alreadyHasInstance=yes

REM This published to prod or dev or uat
IF "%1"=="prod" goto :cond
IF "%1"=="dev"  goto :cond
IF "%1"=="uat" goto :cond
goto :skip
:cond
xcopy  ".\deploy\%1" ".\" /S /Y

REM Publish to production replace your version number and Project id
IF "%1"=="prod" (
IF "%alreadyHasInstance%"=="no" ( 
   gcloud app deploy --project applause-162313

)
IF "%alreadyHasInstance%"=="yes" ( 
gcloud app deploy --version 20170323t163215 --project applause-162313
)

)

REM Publish to uat replace your version number and Project id
IF "%1"=="uat" (
IF "%alreadyHasInstance%"=="no"  ( 
gcloud app deploy --project applause-143518   
)

IF "%alreadyHasInstance%"=="yes" ( 
gcloud app deploy --version 20161015t131551 --project applause-143518
)
)

REM Publish to dev 
IF "%1"=="dev" (
IF "%alreadyHasInstance%"=="no"  ( 
gcloud app deploy --project applause-dev   
)

IF "%alreadyHasInstance%"=="yes" ( 
gcloud app deploy --version 20170303t190417 --project applause-dev
)

)

:skip

