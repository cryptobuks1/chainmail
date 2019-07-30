# Chainmail - Block chain-based encrypted messaging

Chainmail is an email-like program that uses a blockchain to store messages. Each message is encrypted using the JS-NACL Public-key authenticated encryption (crypto_box). This allows for anyone to use end-to-end message encryption while allowing their mesages to be distributed on the block chain. This distribution of messages will make it much more difficult for any entity to block the use of strong end-to-end message encryption. The program is designed to be portable and will run on any Windows OS from a USB stick. Aliases are available as a substitute to your randomly assigned Chainmail address (see below).

## Changes

**For windows and Linux**
Chainmail Version 0.3.2 `(Beta 1)` - First set of bug fixes
- MultiChain v2.0.1 block chain (Community Edition, protocol 20009)
- Node.js v10
- JS-NACL v1.3.2
- Quill Editor v1.3.6


Chainmail Version 0.3.1 `(Beta 1)` - Initial Beta Release
- MultiChain v2.0.1 block chain (Community Edition, protocol 20009)
- Node.js v10
- JS-NACL v1.3.2
- Quill Editor v1.3.6

### Report Beta Release Issues

This is a Beta version of the Chainmail application released to the public for additional testing in the real-world. If you find issues or bugs, please send them to Cedar Creek Technologies, LLC for action.

## Getting Started

There are three ways to get Chainmail up and running:
Start the first two methods by either using git clone git://github.com/thexmann/chainmail.git or by downloading the ZIP file.

The third method is to purchase a pre-built, ready-to-run USB stick from the Chainmail store at https://cchristmann.com/chainmail as well as other goodies.

### To use the program

#### Windows

For MS Windows 7, 8 or 10
Copy the following files and directories from the bin/win directory to a directory on your computer or to a USB stick:
* chainmail-win.exe
* multichaind.exe
* multichain-v8.dll
* run.bat
* chainmail directory
* keys directory
* Either execute the run.bat file or execute the following commands:
  - multichaind.exe chainmail@xmann.ddns.net:9000 -datadir=%CD
  - chainmail.exe
  - Open https://localhost:8088 in a web browser (see below)
Any of the seed nodes can be used in place of the xmann.ddns.net node. Feel free to change the seed node in the bat file.

#### Linux

For Linux 64-bit, supports Ubuntu 12.04+, CentOS 6.2+, Debian 7+, Fedora 15+, RHEL 6.2+.
Copy the following files and directory from the bin/linux directory to a directory on your computer or to a USB stick:
* chainmail-linux
* multichaind
* run.sh
* chainmail directory
* keys (directory)
* Either execute the run.bat file or execute the following commands:
  - multichaind chainmail@xmann.ddns.net:9000 -datadir=$PWD
  - chainmail
  - Open https://localhost:8088 in a web browser (see below)
Any of the seed nodes can be used in place of the xmann.ddns.net node.  Feel free to change the seed node in the sh file.

### TCP Ports Used

Chainmail utilizes three TCP ports:
* 8088 is used for a HTTPs connection between a web browser and the compiled node application
* 9001 is used for Remote Procedure Calls (RPC) between the node application and Multichain
* 9000 is used by Multichain to connect to the Internet and other Multichain nodes

**Port 9000** will need access through firewalls to the Internet.

### To create the chainmail-xxx from source

To create the program from source, the following MUST be installed on your computer:
* pkg from NPM
* nacl.js
* chainmail.js
* package.json
* the mode_modules directory:
* the public directory

To compile, type the following from a commandline prompt :
	`pkg .`

### To create a self-signed SSL certificate
The following is optional to secure communications to the web browser using your own self-signed certificates. Note that you may use the ones contained in the keys directory or, if you have valid signed certificates, those may be used by copying them to the keys and renaiming them to **host.crt** and **host.key**.

Use openssl to create a custom SSL certificate, install openssl , then execute the following at the command prompt:
	`openssl req -x509 -sha256 -newkey rsa:8192 -keyout host.key -out host.crt -days 1095 -nodes`
Copy the **host.crt** and **host.key** to the **keys** directory.

## Deployment

Chainmail may be run from the hard drive of a computer or from an external disk, including a USB stick.

To run from a USB stick using the Chainmail address, it is recommended that a minimum 16 GB be used. Since the block chain has no delete methods, there is no way to remove old mail from the chain. Therefore, as the chain grows, it may be necessary to move to a larger USB stick. Simply copy the entire contents of the smaller stick to the larger stick.

## Web Browser

Chainmail utilizes newer Javascript language constructs. The following web browser versions should work with Chainmail:

* Chrome v 55+
* Firefox v52+
* Opera V 42+
* Safari 10.1+

## Usage

To start the program:
* insert the USB stick into your computer and open the USB drive, or navigate to the chainmail directory on the computer
* double click the **run.bat** batch file

This will start the multichain block chain managment software and the chainmail.exe middleware. It should also open a webpage in your default web browser. 

### Seed Nodes

A seed node is a chainmail node active on the Internet. To connect to the block chain used by Chainmail, you must connect your node to an active seed node.

A list is available from https://cchristmann.com/chainmail. Note that being listed as a chain node does not guarantee the node is active. In the future, the default seed node may change or become temporarily or permanently unavailable. While every effort will be made to prevent the default seed node from becoming inactive, it, too, become temporarily or permanently unavailable. Check the website for other available seed nodes.

### User Access Key

You will then be asked to enter a User Access Code. The User Access Code is your password and cna not ever be changed without loosing access to the Chainmail address and all messages associated with it. **DO NOT FORGET YOUR USER ACCESS CODE. IT CAN NOT BE RECOVERED and ALL MESSAGES WILL BE INACCESSABLE.** This code should also be a strong password as it is used to encrypt your private encryption key. Anyone posessing your unique private encryption key will be able to decrypt all of your messages.

### First Time Run

If this is the first time to run the software, several unique identifiers will be created:
* a unique 12 character Chainmail address unique to you
* a unique block chain node address used by the block chain
* your unique public and private message encryption keys
Your Chainmail address and encryption keys will be encrypted and stored in the keys/local.json file. 

Your User Access Code is the encryption key for your private key. **DO NOT FORGET YOUR USER ACCESS CODE!!!**
Your public encryption key will be published to the block chain for anyone to use when sending you a message.

If you are using the provided or user generated self-signed SSL certificates, the web browser will likely warn you about the certificate being insecure. It is OK to ignore this warning and create an exception for the certificate.

You will be asked to enter your User Access Key a second time after all identifiers and files are created.

Network port 9000 must be accessible from the Internet. Should you have a problem with this, open the firewall application and allow port 9000 access to have incoming access.

### Keys

Your Chainmail address and encryption keys are created the first time you run the software. The encryption keys are protetected using your User Access Code. There are no other copies of your private key or your User Access Code.

To back up your information, make a copy of the chainmail and key directories. 

### Using Chainmail

When started, you must provide your User Access Key which allows the  program to access and decrypt your private encryption key and Chainmail address. Your Chainmail address will be shown in the upper right corner of the chainmail window. It will be three groups of four characters seperated by dashes. 

The last fifty (50) messages will be listed on the left side of the window from most recent backwards as you scroll down. To read a message, click on the envelope beside the from tag. The message will be retrieved from the block chain and decrypted, then dispayed on the right side of the window. You may reply back to the sender or forward the message to a different Chainmail address. A sender must have either your Chainmail address to send you a message.

### Sending a Chainmail

To create a new message to another Chainmail address, click on the red New Mail bar near the top of the window. A text editor will open. You MUST provide a to Chainmail address. the rest is optional. If you would like to send a small attachment file (8MB max), click the Browse button to attach the file. When ready, click send to send the message. Currently only one recipient address is allowed per message.

### Whitelist IPs

Chainmail defaults to only allowing a user to attach to the Node middleware from the local machine. It is recommended for maximum security to keep it this way. However, there may be a reason to allow other IPs to attach to Chainmail. Open the `whitelist.txt`, file found in the keys directory, with a text editor. Add the IP addresses (IPv4 and/or IPv6) to this file, one IP per line and save the file. Chainmail will need to be restarted.

It is recommended to use a whitelist ONLY from within an intranet with a firewall protecting the Chainmail application on ports 8088 and 9001. Ensure the computer running Chainmail has port 8088 open through the local firewall for HTTP connections.


## Illegal Activities
Cedar Creek Technologies, LLC reserves the right to disable any Chainmail address, Chainmail alias, or block chain node shown to be conducting illegal, fraudulant, dangerious or terroristic activities. Report suspected activities to Chainmail address RS9X-PJ4G-B744 or see [https://cchristmann.com/chainmail](https://cchristmann.com/chainmail). Law enforcement, please provide legal documentation or Court Orders as necessary.

Please note, it is not possible to disable or shut-down the entire Chainmail system. Selected nodes addresses can be disabled so that the that node address no longer has access the network; other nodes will reject connections. Only the message recipient has the cryptographic keys necessary to decrypt any specific message addressed to them.

## Built With

* Node [https://nodejs.org](https://nodejs.org)
* js-nacl [https://github.com/tonyg/js-nacl](https://github.com/tonyg/js-nacl) modified by Cedar Creek Technologies
* Multihain [https://www.multichain.com/](https://www.multichain.com/)
* Quill Editor [https://quilljs.com/](https://quilljs.com/)


## Portable web browser
Firefox can be used as a portable web browser. Copy the files to your USB stick from https://portableapps.com/apps/internet/firefox_portable.
This allows  USB stick to be completely independent from the computer configuration.

## Authors

* **Charles Christmann** - Cedar Creek Technologies, LLC, Placitas, NM, USA
Chainmail address: RS9X-PJ4G-B744
Website: https://cchristmann.com/chainmail
Regular email: cedarcreektech@cchristmann.com

## License and Limitations

GNU General Public License v3.0, see [https://www.gnu.org/licenses/gpl-3.0.en.html](https://www.gnu.org/licenses/gpl-3.0.en.html) for details.

Cedar Creek Technologies, LLC or the creators and authors of Chainmail do not warrant that this product is free from defects or is suitable for your application. Cedar Creek Technologies, LLC or the creators and authors of Chainmail shall not be held liable for any defects or operational use which may lead to the disclosure of the information contained in the encrypted portion of the Chainmail system. Additionally, Cedar Creek Technologies, LLC or the creators and authors of Chainmail shall not be held liable for any damages resulting from the use of this software. **USE THIS SOFTWARE AT YOUR OWN RISK.** If you do not agree, you may not install or use this software.

## Some Details

Node JS is used as the middleware between the user and the Multichain. Node provides the user interface via secure HTTP to a web browser. All message cryptographic functions are performed in Node. Multichain performs all blockchain operations and encryption.  Multichain should be the ONLY party of this application with direct access to the Internet, preferably through a firewall.

Chainmail uses the latest JS-NACL cryptographic libraries available at the time of the Chainmail version release. JS-NACL uses the Sodium library to encrypt messages and attachments using the strongest encryption available. All message text is encrypted using unique nonces and stored onchain. All attachements are encrypted seperately with a unique nonce, and stored offchain. The JS-NACL public key crypto box functions are used to encrypt mesages and attachements. The recipient's public key is fetched from the blockchain stream using their Chainmail address. That is combined with your private key to create a mesage or attachment thay requires the recipient to fetch your public key and provide his private key to decrypt the message or attachment.

The Node application which contains the encryption algorithms and encryption keys is not designed to be exposed directly to the Internet or any other network, but will accept specific whitelisted IP addresses. All communication between the web browser (the user interface) and the Node application are protected using a secure sockets certificate. The self-signed or user provided signed certificate protects communications with strong encryption. Additionally, communications from a web browser using a network address other than the localhost or its IPv4 or IPv6 equivelant, or a whitelisted IP, is allowed. Only the Multichain software, on port 9000 requires access to the open internet. Port 9001 used for RPC, must remain on localhost.

Internally, port 9001 is used for RPC communications gbetween the NOde application and the Multichain application. Web browsers will use port 8088 to access the Chainmail user interface web page.

## Security: Now and Later

### Current state
At this time, it is believe that your messages are safe and secure using Chainmail; however, governments are attempting to prevent the use of strong private encryption through legislation requiring back doors. Spy agencies and criminal organizations are actively attempting to break all encryption methodologies.

### Future state
Be aware that, in the future, quantum computers may have the ability to break the encryption used by Chainmail. It is not known if, or when, this will happen. As there is no method available to remove any message or attachment from the chain, be aware that any messeage or attachment is out there, in the ether, on the Internet, scattered amongst multiple computers forever. Your messages and attachments may be vulnerable at some future date.




