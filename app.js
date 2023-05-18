const path = require('path');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const morgan = require('morgan');
const dotenv = require('dotenv').config();

const sequelize = require('./util/database');
const User = require('./models/user');
const Todo = require('./models/todo');

const app = express();

app.use(cors({ origin: 'http://localhost:3000'}));
app.use(cookieParser());

app.use(morgan('combined'));

app.use('/uploads', express.static('uploads'));

app.set('view engine', 'ejs');

const authRoutes = require('./routes/authRoutes');
const todosRoutes = require('./routes/todosRoutes');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(authRoutes);
app.use(todosRoutes);

User.hasMany(Todo, { foreignKey: 'userId' });
Todo.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

const PORT = process.env.PORT || 8000;

sequelize
    .sync()
    .then(main => {
        app.listen(PORT);
        console.log(`Server started on port ${PORT}`);
    })
    .catch(err => {
        console.log(err);
    });
