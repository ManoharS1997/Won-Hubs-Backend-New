FROM node:18

WORKDIR /app

COPY package*.json ./

# Install dev dependencies like nodemon
RUN npm install

# Global nodemon (optional: you can skip if you use local version)
RUN npm install -g nodemon

COPY . .

# Expose the backend port
EXPOSE 3001

# Set environment
ENV NODE_ENV=development

# Run using nodemon (live reload)
CMD ["nodemon", "server/server.js"]
