
### Decrypt an encrypted private key
The encrypted private key file is encrypted-private-key.txt
The passphase used to encrypt the original private key is: examplevalueexamplevalueexamplevalueexamplevalueexamplevalue
Command to decrypt the encrypted-private-key.txt is:
    $ openssl rsa -in enkey -out dekey
        Enter pass phrase for enkey: //enter the above passphase
        writing RSA key

### Renew a certificate
1. copy the existing private key to lowcarbonfuels.gov.bc.ca.key
2. run teh following command to create a new csr based on the existing private key
openssl req -new -newkey rsa:2048 -nodes -key ./lowcarbonfuels.gov.bc.ca.key -out ./lowcarbonfuels.gov.bc.ca.csr
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) []:CA
State or Province Name (full name) []:British Columbia
Locality Name (eg, city) []:Victoria
Organization Name (eg, company) []:Government of the Province of British Columbia
Organizational Unit Name (eg, section) []:
Common Name (eg, fully qualified host name) []:lowcarbonfuels.gov.bc.ca
Email Address []:

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
3. list the csr
openssl req -text -noout -in ./lowcarbonfuels.gov.bc.ca.csr

### Commands for creating csr for itvr
* create password protecting privatekey  
    openssl rand -base64 48 > passphrase.txt
* create encrypted privatekey protected by the above password  
    openssl genrsa -aes256 -passout file:passphrase.txt -out server.key 2048
* create the csr  
    openssl req -new -newkey rsa:2048 -nodes -key ./server.key -out ./electric-vehicle-rebates.gov.bc.ca.csr
* decrypt the encrypted privatekey, it requires to enter the password in passphrase.txt  
    openssl rsa -in ./server.key -out ./privatekey.txt
    