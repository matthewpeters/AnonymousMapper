AnonymousMapper
===============

OVERVIEW:

This project was created by Matthew Peters in support of a specific programming request made on behalf of FIU. The purpose of this project was to enable a basic anonymous reporting system for unauthenticated users to create and submit a 'note' on a google map based custom image.


GOAL/USES:

Apart from being used by the commissioning client (FIU), the project is hereby released as open source and can be altered in any way and for any use so long as some credit is given to the original author (me).

It is my hope that this project may provide a great learning tool or springboard for anyone who needs it. I know personally that is can be difficult for a self-taught programmer to find real working examples of 'simple' tasks. I do not pretend that my code is of the highest quality nor most efficient. Nonetheless, I hope it can prove useful to some. Feel free to offer me feedback of any sort (matthew.peters@ufl.edu).


KEY FEATURES:

As stated above, this project allows for unauthenticated users to place a 'note' on a google map/custom overlay.

This project includes an Admin interface where notes can be approved and or modified.

This project allows for a simple email notification to an admin upon a new note being created. 


HOW TO CONFIGURE:

You will need a SQL or MYSQL database and a microsoft server (azure offers free hosting for testing purposes).

1) Create the database and table using a variation of the dbsetup.sql file.

2) Install the project on your microsoft server (IE publish the website).

3) Configure the file "sourceCode/App_Data/Configuration.cs" for the app to run properly.

4) Test and debug the app accordingly.

Feel free to email me (matthew.peters@ufl.edu) if you have any problems or need some help installing the project.


HELPFULL LINKS

http://stackoverflow.com/questions/15772479/authentication-with-old-password-no-longer-supported-use-4-1-style-passwords