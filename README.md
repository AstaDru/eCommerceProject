# E-Commerce Shop - Project #


## Project Description ##

This project became alive because Me and Sironi had to create an REST API E-Commerce project from our Web Development course. With this in mind we have decided to build a shop. Our first step was to design ERD that made our project to go smoother with visualising how our code suppose to be implemented. Accordingly to our ERD below there are shop, items, cart_items, users and orders tables.Routes avaliable:
1. /register
    * For creating new user account. Adding all given information to users table.
2. /login
    * For logging users in, comparing their given email and password with our database users in users table. If they are correct we are authenticating them using express sessions.
3. /logout
    * For logging user out, we ending express session.
4. /settings
    * For updating given user details in users table
5. /deleteuser
    * For removing user from users table
6. /browse
    * For displaying a list of all items in a shop.
7. /browse/:itemName
    * For displaying information about one searched item by name from items table.
8. /cart
    * For cheching what items user has in his cart.
9. /cart/additem
    * For adding an item to a cart with given quantity.
10. /cart/removeitem
    * For removing cart_item from user cart.
11. /cart/changeqty
    * For changing cart_item table quantity by name with given amount.
12. /cart/clear
    * For clearing all cart_item in current user cart.
13. /cart/checkout
    * For checkout user cart, generate order to be dispatched.
14. /cart/:cartId
    * For viewing searched cart_item in cart.
15. /orders
    * For viewing all user orders.

Since this is a simple REST API, any products selling company could have a use of it, let it be clothes, food shop selling groceries, gym company selling their plans as items, domains company seeling domains as items etc...
![E-Commerce ERD image](images/ecommerceERD.png)



## Instructions ##

### To open or use this file in your application: ###
1. If you do not have a code editor, you will have to download a code editor and set it up first to be able to use and view this code properly.

2. Tips:
    * I would suggest to use "Visual Studio Code" editor. This software is free and easy to use. Link to download: [Visual Studio Site](https://code.visualstudio.com/download). It has instrutions of how to install this software on your computer, laptop or any other device that you use. There are different installation options for windows and mac users. Just visit this site and you will find all information that you need to be able to install this software and use it.
    * More information about other great editors that are out there visit [links to editors](https://toolbox.hashnode.com/35-best-free-code-editors).

3. Use any suggestion from options below.
    * Download this file, extract, save it in your computer and add it to your code editor.
    * Copy this code repository and add it to your editor to view it.
    * Create seperate files in your code editor, copy code snapshots from this file and paste it to your code editor.


4. To view it on your browser window:

    * If you are useing Visual Studio Code follow instructions below:
        * To view a document of this API go to your terminal, make sure you are in 'swagger-editor-master' folder.
        * Type in 'npm start' or 'npm start --force'.
        * Type 'localhost:3001' in your browser. Navigate to your local storage by clicking the right button on your opened browser, click 'inspect'. A window will pop up on your right hand side. On the top click a field called 'Application', on the left hand side find a field 'Local Storage'. Click on it and click also on to another field below called 'http://loalhost:3001/'. There are 'Key' and 'Value' columns. 
        * Copy all content from 'ecommerce.yaml' file that exists in this project and paste it into 'Value' column that has a 'Key' row 'swagger-editor-master'. 
        * Then refresh your browser and you will be able to see a current document of this REST API.
    
    
    * If useing any other application editor follow instructions below:
        * You will have to follow your application editor commands to be able to view this document API.
        * Must start 'swagger-editor-master' file to be able to view this document in your browser.
        * If manage to start it, then 
        copy all content from 'ecommerce.yaml' file that exists in this project and paste it into your browser 'Local storage' 'Value' that has a 'Key' called 'swagger-editor-master'.
        * Refresh your browser and you suppose to be able to see a current document of this REST API.

### Technologies ###

*We used Visual Studio Code application editor for our project, because it is free, has everything you need to build an application, well documented instructions of how to use it. Also it is a very popular application editor that web developers use. <br> We created a server with express framework that handled our workflow.
<br>Me and Sironi decided that PostgreSQL tool called pgAdmin will be the best choise for us because it is the most advanced Open Source database in the world.
<br>Postman tool was used for testing our routes, request bodys and responses.
<br>Our ERD is built with help from lucid visual collaboration website.
<br>We used Swagger editor for documenting our REST API, because it is a great tool for building and documenting API's, free, easy to use, popular in web development enviroment.
<br>
<br>[Postman page](www.postman.com)
<br>[Lucid page](www.lucidchart.com)
<br>[Visual Studio Code page](code.visualstudio.com)
<br>[pgAdmin page](https://www.pgadmin.org/)
<br>[Express page](expressjs.com)
<br>[Swagger page](swagger.io/swaggerhub/free-trial)*



### Collaborators ###

*Sironi invested a lot of time to create this project with me. He had great ideas that we put together and added to this project.*

### License ###

* This project is under MIT license. 
* [More about this license](https://mit-license.org/) *

