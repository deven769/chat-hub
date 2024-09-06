# chat-application

## Running server with Docker

1. Command to up container
	
	docker compose up
	
	or 

	docker compose up --build
	

	NOTE: make sure your host port is not running on 6379


2. After server up: Open index.html in browser from
	chat-hub/frontend/index.html


## For Testing use following users to login:
	1. username: user           password: admin
	2. username: user1          password: admin
	3. username: user2          password: admin


## DESCRIPTION

 	Simple chat application which use django channels for real time communication
 	and Django restframework for API. All the authenticated user can send message 
 	in a default room (which is static). Message sent by authenticated user is saved
 	to sqlite database for data persistance. 

 	Frontend uses html, css and javascript which can be access by opening index.html
 	in browser. 