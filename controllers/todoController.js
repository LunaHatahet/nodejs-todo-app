const Todo = require("../models/todo");
const User = require("../models/user");
const Email = require("../util/email");
const { v4: uuidv4 } = require("uuid");

exports.pagination = (req, res, next) => {
  const pageSize = req.query.pageSize || 5;
  const page = req.query.page || 1;
  const offset = (page - 1) * pageSize;

  Todo.findAndCountAll({
    where: { userId: req.user.id },
    limit: parseInt(pageSize),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
  })
    .then((result) => {
      const lists = result.rows;
      const count = result.count;
      const pageCount = Math.ceil(count / pageSize);
      res.status(200).json({ lists, pageCount, pageSize, page });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    });
};

exports.createList = (req, res, next) => {
  const { name, status, items } = req.body;
  const attachment = req.file ? req.file.filename : null;
  const userId = req.user.id;
  const id = uuidv4();

  User.findOne({ where: { id: userId } })
    .then((user) => {
      const userEmail = user.email;
      Todo.create({
        id: id,
        name: name,
        status: status,
        items: items,
        attachment: attachment,
        userId: userId,
      })
        .then(() => {
          Email.sendNewListCreationEmail(userEmail);
          res.status(200).json({ message: "List created successfully" });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ error: "Failed to create list" });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    });
};

exports.editList = (req, res, next) => {
  Todo.findOne({ where: { id: req.params.id } })
    .then((todo) => {
      res.status(200).json({ todo: todo.toJSON() });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    });
};

exports.updateList = (req, res, next) => {
  const { name, status, items } = req.body;
  const attachment = req.file ? req.file.filename : null;

  Todo.findByPk(req.params.id)
    .then((todo) => {
      todo.name = name;
      todo.status = status;
      todo.items = items;
      todo.attachment = attachment;
      return todo.save().then((result) => {
        console.log("List has been updated!");
        res.status(200).json({ message: "List has been updated" });
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};

exports.viewAttachment = (req, res, next) => {
  Todo.findOne({ where: { attachment: req.params.attachment } })
    .then((todo) => {
      res.render("attachment", { todo: todo.toJSON() });
    })
    .catch((error) => console.log(error));
};

exports.deleteList = (req, res, next) => {
  Todo.destroy({ where: { id: req.params.id } })
    .then(() => {
      res.status(200).end();
    })
    .catch((error) => console.log(error));
};
