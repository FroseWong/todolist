const http = require("http");
const errHandle = require("./errHandle");
console.log("test ok");
const { v4: uuidv4 } = require("uuid");

const todos = [];

const requestListener = (req, res) => {
  // req可以取得使用者的資料
  console.log(req.url); // / 代表根目錄
  console.log(req.method); // GET
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };

  let body = "";

  req.on("data", (chunk) => {
    console.log(chunk);
    body += chunk;
  });

  if (req.url === "/todos" && req.method === "GET") {
    res.writeHead(200, headers);
    res.write(JSON.stringify({ status: "success", data: todos }));
    res.end();
  } else if (req.url === "/todos" && req.method === "POST") {
    req.on("end", () => {
      try {
        const focusTitle = JSON.parse(body).title;

        if (focusTitle !== undefined) {
          const todo = {
            title: focusTitle,
            id: uuidv4(),
          };

          todos.push(todo);
          res.writeHead(200, headers);
          res.write(JSON.stringify({ status: "success", data: todos }));
          res.end();
        } else {
          res.writeHead(400, headers);
          res.write(
            JSON.stringify({
              status: "false",
              message: "欄位填寫未正確或id未填寫",
            })
          );
          res.end();
        }
      } catch (err) {
        console.log(err);
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: "false",
            message: "欄位填寫未正確或id未填寫",
          })
        );
        res.end();
      }
    });
  } else if (req.url.startsWith("/todos") && req.method === "DELETE") {
    if (req.url.startsWith("/todos/")) {
      const id = req.url.split("/").pop();
      const focusIndex = todos.findIndex((eachTodo) => eachTodo.id === id);
      if (focusIndex !== -1) {
        todos.splice(focusIndex, 1);
        res.writeHead(200, headers);
        res.write(JSON.stringify({ status: "success", data: todos }));
        res.end();
      } else {
        errHandle(res);
      }
    } else {
      todos.length = 0; // 利用給予length = 0的方式刪除array中的element
      res.writeHead(200, headers);
      res.write(JSON.stringify({ status: "success", data: todos }));
      res.end();
    }
  } else if (req.url === "/todos" && req.method === "DELETE") {
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(JSON.stringify({ status: "success", data: todos }));
    res.end();
  } else if (req.url.startsWith("/todos/") && req.method === "PATCH") {
    req.on("end", () => {
      try {
        const focusTitle = JSON.parse(body).title;
        const id = req.url.split("/").pop();
        const focusIndex = todos.findIndex((eachTodo) => eachTodo.id === id);
        if (focusTitle !== undefined && focusIndex > -1) {
          res.writeHead(200, headers);

          todos[focusIndex].title = focusTitle;

          res.write(JSON.stringify({ status: "success", data: todos }));
          res.end();
        } else {
          console.log("title !== undefined && focusIndex > -1 ELSE");
          errHandle(res);
        }
      } catch {
        console.log("catch !");
        errHandle(res);
      }
    });
  } else if (req.method === "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({ status: "false", message: "無此網站路由" }));
    res.end();
  }
};

const server = http.createServer(requestListener); // 當有使用者進來網頁時，就會觸發

server.listen(process.env.PORT || 3005); // 左邊沒有就讀取右邊
