#!/bin/bash

exit 0

# comment out email connection checking as zeva switches to CHES
#emailConnectionTest=$(python3 /etc/nagios3/commands/check_email_connection.py)
#echo $emailConnectionTest
#if [[ $emailConnectionTest == OK* ]];
#then
#        exit 0
#else
#        exit 2
#fi
