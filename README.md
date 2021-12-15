# What is it
This is a yearly review of what ablum you should buy based on your spotify activity. It counts the number of tracks you've liked per albums and order them this way.
![Screenshot](https://user-images.githubusercontent.com/1755357/146178872-2450752d-c418-4871-a2dd-7d7e1a07ea16.png)



## Setup
### LIMITATIONS
Because of Spotify having a non-competition clause for API keys, I cannot provide a live version that will work without me managing your email. I don't want to do that and particularly because it would be limited to 15 people.

### Configuration
Install dependencies running `yarn` 

You then need to create an OAuth client key on [spotify API](https://developer.spotify.com/dashboard/login) with proper redirect URLs and set it in the index.js in the `setLoginUrl` function. Then add your own account to be allowed to use that client.

## Usage
Click on the button to login.
You'll be redirected with your stats.

