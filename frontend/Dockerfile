# Use an official Nginx image from the Docker Hub
FROM nginx:alpine

# Copy the static files (HTML, CSS, JS, etc.) into the Nginx default directory
COPY . /usr/share/nginx/html

# Expose port 80 to serve the frontend
EXPOSE 80

# Start the Nginx server (this is done automatically with the base image)
CMD ["nginx", "-g", "daemon off;"]
