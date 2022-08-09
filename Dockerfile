FROM node:15

#Specify a working directory
WORKDIR /usr/app

#Copy the dependencies file
COPY ./package.json ./

#Copy the project
COPY ./ ./

#Install dependencies
RUN npm install 

#Copy remaining files
COPY ./ ./


#Default command
CMD ["npm","start","run"]
