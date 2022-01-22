# FRT_AMHIS

This is my project for submission to Future Ready Talent, a govt. initiated internship powered by Microsoft.

# PREFACE

Firstly, I would like to take a moment of time to give my thanks to everyone behind the administration and management of this Internship session to provide us students with an oppurtunity like this, where we got to learn and experience so much about the actual production and real life scenarios, and all the problems and solutions that can be applied for those problems. 

The introduction of cloud computing to services is one of the best and biggest leap towards the evolution of faster and better services and service platforms. It allows more flexibility, better computing power, better uptime and better management of services all at one place.

# INTRODUCTION TO PROJECT

I have chosen Health inductry and a fairly common problem that can be tackled better by using the power of cloud computing. The problem statement that I am going to work with is "Management of large scale Inventories for either departments of a same hospital, a group of hospitals belonging to same group or a group of health industries linked with each other in the line of production and the automation of transfer of items between these industries."

Further explaining the problem statement, we all are familiar with the management of inventories in any industires. It is one of the fundamental neccesities in almost any industry. Same with the health industries, They can have many types of inventories such as Medical supply inventories, medical equipments inventories, medical vehicle inventories and so on. They can also have depratments with different inventories for different departments, and having different departments it is a basic need for management of transfer of entities between different inventories. 

I have a hypothesis for the solution to this problem, that is to create a "Automated Modular Hospital Inventory System". This solution consists of two major points of interest:

1. MODULARITY: 
    A modular systm is a type of system which contains several individual entities and connections between them as separate relationships. We can use this approach for the inventory system, which would help in better maintainance of inventories, reduction of risk of faulty transactions of items from inventories and easier scaling up of inventory quantity.

2. AUTOMATION:
    The transfer of items between inventories are often similar to a basic statement, i.e. "If THIS item decreases from THIS given amount in THIS inventory, tranfer THIS much quantity of the item from THAT inventory to THIS inventory." Pardon the laymen language, but it is enough to understand the situation. So we can automate the procss of transfer of items by adding connections between two inventories for specific items.

These two functionalities will make for a better inventory system that can be used by many health industries and help them save a lot of time and resources in maintainance and management. Also, as a side note, this project can be implemented in many other industries and is not just confined to the health industry.

# TECHNICAL INTRODUCTION
    
For this project, I will be creating a NodeJS Web apllication for the modular inventory system. The project folder is the same as that of the NodeJS application.

For the Automation I will be using Azure Functions and use an HTTP trigger for automation of item transfer between inventories. I will add a folder name FRT_AMHIS_FUNCTION for the source code of Azure Functions app.

I have also created a database using SQL server to store the details of all the users, inventories items and transfer logs. The databas is hosted on my Azure student portal, so I will try to add a folder named "FRT_AMHIS_SQL" containg Database and Table structure and Source code.

# INSTALLATION OF PROJECT

## REQUREMENTS

If you want to run this project on local host, you will need following items for successful setup of the project:

1. VS CODE (text editor)
2. GIT bash
3. MySQL server 
4. MySQL workbench (Optional, for ease of setup)
5. Azure functions (You can use Azure functions extension from VS CODE)
6. NPM (Node Package Manager)
7. A compatible browser

## STEPS OF INSTALLATION


### STEPS TO SETUP THE DATABASE
1. Open MySQL workbench and connect your local MySQL server in the Workbench.
2. Now goto File > Open SQL script... And select the sql script present in folder "FRT_AMHIS_SQL".
3. Click on run SQL to create the database and tables required for project.

### STEPS TO SETUP FUNCTIONS APP
1. Open VS code and Select Azure in the Tools sidebar. 
2. On functions taab, click on 'CREATE Function".
3. Follow the steps to create the function and open it in VS code.
4. In index.js file, paste the contents of the file "index.js" present in "FRT_AMHIS_FUNCTION" folder.
5. Click on F5 to run the function app in debug mode.
6. Note the function app URL in debug terminal, it will be used later.

### STEPS TO SETUP NODE APPLICATION

1. Clone this project using "git clone".
2. Open the project directory in VS CODE.
3. Goto .env.txt file and update all details in angular brackets "<>", to match the details of your local project setup.
4. Open a GIT bash terminal in VS code and type 'npm i' to install required dependencies for the app.
5. type and run 'npm start' to start the server on localhost. 
6. Type 'http://localhost:5000" on browser to run the web app.

# PROJECT RUNNING DEMO

The project's running demo can be found on this link: 'https://frt-amhis-webapp.azurewebsites.net'. It is made using Azure free account so it would not work after exhausting all of the credit Azure provides for free.

I have hosted the website for free on Heroku app also. The link is "https://frt-amhis.herokuapp.com/login". Note that the automation part won't work as it can be hosted only on either Azure platforms or on Localhost.

# ISSUES

If you find any issues in this project, you can always raise an Issue on this repository, I would be more than happy to learn about my mistakes as I myself am in the learning phase. If you have any suggestions or changes for this project, you can raise a "Pull request" on this repository.
