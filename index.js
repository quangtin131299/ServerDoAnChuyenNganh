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
  let sqlquery = `SELECT khachhang.ID, khachhang.HoTen, khachhang.Email,DATE_FORMAT(khachhang.NgaySinh, '%d/%m/%Y') as NgaySinh, khachhang.SDT,khachhang.Account, khachhang.Password FROM khachhang WHERE Account = '${req
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
    let sqlquery = `SELECT phim.ID, phim.TenPhim, phim.Hinh, phim.ThoiGian, loaiphim.TenLoai, phim_loaiphim.MoTa, phim_loaiphim.NgayKhoiChieu from phim JOIN phim_loaiphim ON phim.ID = phim_loaiphim.ID_Phim JOIN loaiphim ON loaiphim.ID = phim_loaiphim.ID_Loai WHERE phim.ID = ${req
      .query.idmovie} AND phim.TrangThai = N'đang chiếu'`;

    conn.query(sqlquery, function(err, result) {
      if (err) {
        res.send(err);
      } else {
        let temptenphim = "";
        let mangkq = [];
        for (let i = 0; i < result.length; i++) {
          if (result[i].TenPhim !== temptenphim) {
            for (let j = i + 1; j < result.length; j++) {
              if (result[j].TenPhim === result[i].TenPhim) {
                result[i].TenLoai += ", " + result[j].TenLoai;
              }
            }
            temptenphim = result[i].TenPhim;
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
  let sqlquery = `SELECT rapphim.ID, rapphim.TenRap, rapphim.Hinh, rapphim.DiaChi from rapphim`;
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

//phan quan trong nhat
app.get("/datvephim", function(req, res) {
  let ngaydat = req.query.ngaydat;
  let idsuat = req.query.idsuat;
  let idghe = req.query.idghe;
  let idphim = req.query.idphim;
  let idkhachhang = req.query.idkhachhang;
  let idrap = req.query.idrap;
  let idhoadon = req.query.idhoadon;
  let status = req.query.status;

  let sqlquery = `INSERT INTO vedat VALUES (NULL, '${ngaydat}', '${idsuat}', '${idghe}', '${idphim}', '${idkhachhang}', '${idrap}', '${idhoadon}', '${status}')`;

  conn.query(sqlquery, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send("Đặt vé thành công!");
    }
  });
});

app.get("/loadxuatchieu", function(req, res) {
  let idphim = req.query.idphim;
  let idrap = req.query.idrap;
  let ngayhientai = req.query.ngayhientai;
  let sqlquery = `SELECT phim_phong_xuat.Ngay, suatchieu.ID, suatchieu.Gio from phim_phong_xuat JOIN suatchieu ON phim_phong_xuat.ID_XuatChieu = suatchieu.ID JOIN lichchieu on lichchieu.ID = suatchieu.ID_LichChieu JOIN rapphim on rapphim.ID = lichchieu.ID_Rap JOIN phim ON phim_phong_xuat.ID_Phim = phim.ID
                  WHERE rapphim.ID = ${idrap} AND phim.ID = ${idphim} AND lichchieu.Ngay = '${ngayhientai}'`;
  conn.query(sqlquery, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/loadve", function(req, res) {
  let iduser = req.query.iduser;
  let sqlquery = `SELECT rapphim.DiaChi, phim.Hinh, phim.ThoiGian, vedat.ID, phong.TenPhong, rapphim.TenRap, phim.TenPhim , vedat.NgayDat, ghe.TenGhe, suatchieu.Gio
  FROM vedat JOIN phim ON phim.ID = vedat.ID_Phim JOIN suatchieu ON suatchieu.ID = vedat.ID_Suat JOIN ghe on ghe.ID = vedat.ID_Ghe JOIN khachhang ON khachhang.ID = vedat.ID_KhachHang JOIN  rapphim ON rapphim.ID = vedat.ID_Rap JOIN phim_phong_xuat ON phim_phong_xuat.ID_XuatChieu = suatchieu.ID JOIN phong ON phim_phong_xuat.ID_Phong = phong.ID
  WHERE vedat.Status = N'Đã đặt' AND khachhang.ID = ${iduser}`;

  conn.query(sqlquery, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/loadghe", function(req, res) {
  let rapphim = req.query.rapphim;
  let idphim = req.query.idphim;
  let suatchieu = req.query.suatchieu;
  let ngaydathientai = req.query.ngaydathientai;

  let sqlquery = `SELECT ghe.ID, phim.TenPhim, ghe.TenGhe, ghe_phong.TrangThai FROM ghe JOIN ghe_phong ON ghe.ID = ghe_phong.ID_Ghe JOIN phong ON phong.ID = ghe_phong.ID_Phong JOIN phong_rap ON phong_rap.ID_Phong = phong.ID JOIN rapphim ON rapphim.ID = phong_rap.ID_Rap JOIN phim_phong_xuat ON phim_phong_xuat.ID_Phong = phong.ID JOIN phim ON phim.ID = phim_phong_xuat.ID_Phim JOIN suatchieu ON suatchieu.ID = phim_phong_xuat.ID_XuatChieu JOIN lichchieu ON lichchieu.ID_Rap = rapphim.ID WHERE phim.ID = ${idphim} AND suatchieu.Gio = '${suatchieu}' AND rapphim.ID = ${rapphim} AND ghe_phong.NgayDat ='${ngaydathientai}' AND lichchieu.Ngay = '${ngaydathientai}'`;

  conn.query(sqlquery, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/loadphong", function(req, res) {
  let suatchieu = req.query.suatchieu;
  let idphim = req.query.idphim;
  let idrap = req.query.idrap;
  let ngayhientai = req.query.ngayhientai;
  let sqlquery = `SELECT suatchieu.Gio,phong.ID,phong.TenPhong FROM phong JOIN phong_rap ON phong.ID = phong_rap.ID_Phong JOIN rapphim ON rapphim.ID = phong_rap.ID_Rap JOIN phong_lichchieu ON phong_lichchieu.ID_Phong = phong.ID JOIN lichchieu ON lichchieu.ID = phong_lichchieu.ID_LichChieu JOIN phim_phong_xuat ON phim_phong_xuat.ID_Phong = phong.ID JOIN suatchieu ON suatchieu.ID = phim_phong_xuat.ID_XuatChieu WHERE phim_phong_xuat.Ngay = '${ngayhientai}' AND rapphim.ID = ${idrap} AND phim_phong_xuat.ID_Phim = ${idphim} AND suatchieu.Gio = '${suatchieu}'`;

  conn.query(sqlquery, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.post("/capnhatthongtinkhach", function(req, res) {
  let hoten = req.body.hoten;
  let email = req.body.email;
  let ngaysinh = req.body.ngaysinh;
  let sodienthoai = req.body.sodienthoai;
  let idkhachhang = req.body.idkhachhang;
  let sqlquery = `UPDATE khachhang SET khachhang.HoTen = '${hoten}' , khachhang.Email = '${email}', khachhang.NgaySinh = '${ngaysinh}', khachhang.SDT = '${sodienthoai}' WHERE khachhang.ID = ${idkhachhang}`;

  conn.query(sqlquery, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send("Cập nhật thành công");
    }
  });
});

// GET, POST -> sử dụng query
