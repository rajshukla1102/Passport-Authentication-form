const express=require("express")
const app=express();
const routes=require('./route')
const path=require("path")





app.set("view engine",'ejs');
app.set('views',path.join(__dirname,'views'))


app.get('/',routes) 
app.get('/login',routes) 
app.post('/register',routes)
app.post('/login',routes)
app.get('/index',routes) 
app.get('/logout',routes) 
app.post('/addmsg',routes) 



const PORT =process.env.PORT||5000
app.listen(PORT,()=> console.log("Server Port started at",PORT)) 