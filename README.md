# chat-application

## Running server with Docker

1. Command to up container

	docker compose up --build 

	or 

	docker compose up --build -d

2. After server up: Open index.html in browser from
	chat-application/frontend/index.html



## DESCRIPTION

 	Simple chat application which use django channels for real time communication
 	and Django restframework for API. All the authenticated user can send message 
 	in a default room (which is static). Message sent by authenticated user is saved
 	to sqlite database for data persistance. 

 	Frontend uses html, css and javascript which can be access by opening index.html
 	in browser. 