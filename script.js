const express = require("express");
const app = express();
const mysql = require("mysql2");
const path = require("path");
const {v4:uuidv4} = require("uuid");
const methodOverride = require("method-override");

const port = 8080;

app.listen(port,()=>{
    console.log("Port Active.");
});

//setting connection to Database.

const connection = mysql.createConnection({
    host : "localhost",
    user : "root",
    database : "college",
    password : "Mysql@2004"
});

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended : true}));   
app.use(methodOverride("_method"));

//Homepage.
app.get("/",(req,res)=>{
    let q="select count(*) from users";
try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        let count = result[0]["count(*)"];
        res.render("home.ejs",{count});
    });
}catch(err){
    console.log(err);
}
});

//view all users.
app.get("/user",(req,res)=>{
    let q = "SELECT * FROM users";
    count=1;
    try{
        connection.query(q,(err,users)=>{
        if(err) throw err;
        res.render("viewUser.ejs",{users,count});
    });
    }catch(err){
        console.log(err);
    }
});

//create new user.
app.get("/user/new",(req,res)=>{
    res.render("newUser.ejs");
});

app.post("/user",(req,res)=>{
    let id = uuidv4();
    let {username,email,password} = req.body;
    let value = [id,username,email,password];
    console.log(value);
    let q = "INSERT INTO users VALUES (?,?,?,?)";
    try{
        connection.query(q,value,(err,result)=>{
        if(err) throw err;
        console.log(result);
        res.redirect("/user");
    });
    }catch(err){
        console.log(err);
    }
});

//update user.
app.get("/user/:id",(req,res)=>{
    let {id} = req.params;
    res.render("updateUser.ejs",{id});
});

app.patch("/user/:id",(req,res)=>{
    let {id} = req.params;
    let {username,email,password} = req.body;
    let q = `SELECT password from users WHERE id = '${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            //checking if entered password is correct.
            if(result[0].password == password){
                let q = `UPDATE users SET username = '${username}' , email = '${email}' WHERE id = '${id}'`;
                try{
                    connection.query(q,(err,result)=>{
                        if(err) throw err;
                        console.log(result);
                    });
                }catch(err){
                    console.log(err);
                }
                res.redirect("/user");
            }
            else{
                res.send("Invalid  Password.");
            }
        });
    }catch(err){
        console.log(err);
    }
})

//delete user.
app.get("/user/:id/destroy",(req,res)=>{
    let {id} = req.params;
    res.render("destroyUser.ejs",{id});
});
app.delete("/user/:id",(req,res)=>{
    let {id} = req.params;
    let {email:checkMail,password:checkPass} = req.body;
    let q = `SELECT * FROM users where id = '${id}'`;
    try{
        connection.query(q,(err,user)=>{
            if(err) throw err;
            //checking if entered email and password are correct.
            if(user[0].email == checkMail && user[0].password == checkPass){
                let q = `DELETE FROM users WHERE id = '${id}'`;
                try{
                    connection.query(q,(err,result)=>{
                        if(err) throw err;
                        console.log(result);
                        res.redirect("/user")
                    });
                }catch(err){
                    console.log(err);
                }
            }
            else{
                res.send("Invalid Email Or Password.");
            }
        })
    }catch(err){
        console.log(err);
    }
})