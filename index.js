const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const route = express.Router();
const app = express();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencode

var urlencodedParser = bodyParser.urlencoded({ extended: false });

const conn = mysql.createConnection({
  host: "db4free.net",
  user: "quang_tin",
  password: "Ngolamquangtin1@",
  database: "datvephim",
  port: 3306,
});

app.listen(process.env.PORT || 3000);

app.get("/", function(req, res) {
  conn.query("SELECT * FROM ghe", function(err, result) {
    res.json(result);
  });
});

app.get("/search", function(req, res) {
  console.log(req.query.id);
});

app.post("/login", function(req, res) {
  console.log();

  let sqlquery = `SELECT khachhang.HoTen, khachhang.Email, khachhang.NgaySinh, khachhang.SDT,khachhang.Account, khachhang.Password FROM khachhang WHERE Account = '${req
    .body.account}' AND Password = '${req.body.password}'`;

  conn.query(sqlquery, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      if (result) {
        res.json(result);
      } else {
        res.send("fail");
      }
    }
  });
});

app.post("/register", function(req, res) {
  let hoten = req.body.hoten;
  let email = req.body.email;
  let ngaysinh = req.body.ngaysinh;
  let sdt = req.body.sdt;
  let account = req.body.account;
  let password = req.body.password;

  let sqlquery = `INSERT INTO khachhang VALUES (NULL,'${hoten}', '${email}','${ngaysinh}','${sdt}','${account}','${password}')`;

  conn.query(sqlquery, function(err) {
    if (err) {
      res.send(err);
    } else {
      res.send("Đăn ký Thành công!");
    }
  });
});

app.get("/loadchitietphim", function(req, res) {
  
  if (Number(req.query.idmovie) != -1) {
    let sqlquery = `SELECT phim.ID, phim.TenPhim, phim.Hinh, phim.ThoiGian, loaiphim.TenLoai, phim_loaiphim.MoTa, phim_loaiphim.NgayKhoiChieu from phim JOIN phim_loaiphim ON phim.ID = phim_loaiphim.ID_Phim JOIN loaiphim ON loaiphim.ID = phim_loaiphim.ID_Loai WHERE phim.ID = ${req.query.idmovie} AND phim.TrangThai = N'đang chiếu'`;

    conn.query(sqlquery, function(err, result) {
      if (err) {
        res.send(err);
      } else {
        let temptenphim = "";
        let mangkq = [];
        for (let i = 0; i < result.length; i++) {
          if (result[i].TenPhim !== temptenphim) {
            for (let j = i; j < result.length; j++) {
              if (result[j].TenPhim === result[i].TenPhim) {
                result[i].TenLoai += ", " + result[j].TenLoai;
                temptenphim = result[i].TenPhim;
              }
            }
            mangkq.push(result[i]);
          }
        }
        res.json(mangkq);
      }
    });
  } else {
    res.send("phim không tồn tại");
  }
});

app.get("/loadphimdangchieu", function(req, res) {
  let sqlquery = `SELECT phim.ID ,phim.TenPhim, phim.ThoiGian ,phim.Hinh, phim.TrangThai from phim WHERE phim.TrangThai = N'đang chiếu'`;

  conn.query(sqlquery, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/loadphimsapchieu", function(req, res) {
  let sqlquery = `SELECT  phim.ID, phim.TenPhim, phim.ThoiGian ,phim.Hinh, phim.TrangThai from phim WHERE phim.TrangThai = N'Sắp chiếu'`;
  conn.query(sqlquery, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/loadrapphim", function(req, res) {
  let sqlquery = `SELECT rapphim.TenRap, rapphim.Hinh, rapphim.DiaChi from rapphim`;
  conn.query(sqlquery, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/loadphimyeuthich", function(req, res) {
  let sqlquery = `SELECT phim.ID,phim.TenPhim, phim.ThoiGian, phim.Hinh, phim_loaiphim.MoTa FROM phim JOIN phim_loaiphim ON phim.ID = phim_loaiphim.ID_Phim LIMIT 3`;
  conn.query(sqlquery, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

// GET, POST -> sử dụng query
