FROM nikolaik/python-nodejs:latest
MAINTAINER Jamie Bartlett <jamielukebartlett@gmail.com>

EXPOSE 2095/tcp

RUN pip install spotdl
RUN spotdl --download-ffmpeg

# Copy the local node-proj directory to the container's /node-proj directory
COPY ./node-proj /node-proj

# Install Node.js dependencies
RUN cd /node-proj && npm install

WORKDIR /node-proj

# Specify the command to run the application
CMD ["node", "index.mjs"]
