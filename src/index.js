const express = require('express');
const cors = require('cors');

require('./db/mongoose')
const port = process.env.PORT;
const app = express();
const filesRouter = require('./routers/filesRouter');
const userRouter = require('./routers/usersRouter')

app.use(cors());
app.use(express.json());
app.use(filesRouter);
app.use(userRouter)

app.use("/", (req, res) => {
    res.send("1");
});

app.listen(port, () => console.log("Server connected, port:", port));