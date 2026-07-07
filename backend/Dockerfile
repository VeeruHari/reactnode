FROM node:22

# Create working directory
WORKDIR /app

# Copy package files first (better Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose Express port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "dev"]
