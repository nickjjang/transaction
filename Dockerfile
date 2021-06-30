FROM node:14
# Create app directory
RUN mkdir -p /use/src/app
#setting working directory in the container
WORKDIR /usr/src/app
# Install app dependencies
COPY . /usr/src/app/
# COPY package.json /usr/src/app
RUN npm install
# Copy app source code
#Expose port and start application
EXPOSE 3000
CMD [ "node", "app.js" ]
