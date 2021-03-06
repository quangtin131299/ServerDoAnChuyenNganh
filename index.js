const express = require("express");
const mysql = require("mysql");
const format = require("date-format");
const bodyParser = require("body-parser");
const app = express();

app.listen(process.env.PORT || 3000);

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencode

const conn = mysql.createConnection({
  host: "db4free.net",
  user: "quang_tin",
  password: "Ngolamquangtin1@",
  database: "datvephim",  
  port: 3306,
});

//#region Phần Client
app.post("/login", function (req, res) {
 
  let sqlquery = `SELECT khachhang.ID, khachhang.HoTen, khachhang.Email,DATE_FORMAT(khachhang.NgaySinh, '%d/%m/%Y') as NgaySinh, khachhang.SDT,khachhang.Account, khachhang.Password FROM khachhang WHERE Account = '${req.body.account}' AND Password = '${req.body.password}'`;

  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result[0]);
    }
  });
});

app.post("/register", function (req, res) {
  let hoten = req.body.HoTen;
  let email = req.body.Email;
  let ngaysinh = req.body.NgaySinh;
  let sdt = req.body.SDT;
  let account = req.body.Account;
  let password = req.body.Password;

  let sqlquery = `INSERT INTO khachhang VALUES (NULL,'${hoten}', '${email}','${ngaysinh}','${sdt}','${account}','${password}')`;

  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      ngaysinh = format("dd/MM/yyyy", new Date(ngaysinh));
      res.send({
        ID: result.insertId,
        HoTen: hoten,
        Email: email,
        NgaySinh: ngaysinh,
        SDT: sdt,
        Account: account,
        Password: password,
      });
    }
  });
});

app.get("/loadchitietphim", function (req, res) {
  if (Number(req.query.idmovie) != -1) {
    let sqlquery = `SELECT phim.ID, phim.TenPhim, phim.Trailer,phim.Hinh, phim.ThoiGian, loaiphim.TenLoai, phim_loaiphim.MoTa, phim_loaiphim.NgayKhoiChieu from phim JOIN phim_loaiphim ON phim.ID = phim_loaiphim.ID_Phim JOIN loaiphim ON loaiphim.ID = phim_loaiphim.ID_Loai WHERE phim.ID = ${req.query.idmovie} AND phim.TrangThai = N'đang chiếu'`;

    conn.query(sqlquery, function (err, result) {
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

        res.json(mangkq[0]);
      }
    });
  } else {
    res.send("phim không tồn tại");
  }
});

app.get("/loadphimdangchieu", function (req, res) {
  let sqlquery = `SELECT phim.ID ,phim.TenPhim, phim.ThoiGian ,phim.Hinh, phim.TrangThai from phim WHERE phim.TrangThai = N'đang chiếu'`;

  conn.query(sqlquery, function (err, result) {
    if (err) {
      console.log(err);
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
});

app.get("/loadphimsapchieu", function (req, res) {
  let sqlquery = `SELECT  phim.ID, phim.TenPhim, phim.ThoiGian ,phim.Hinh, phim.TrangThai from phim WHERE phim.TrangThai = N'Sắp chiếu'`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/loadrapphim", function (req, res) {
  let sqlquery = `SELECT rapphim.ID, rapphim.TenRap, rapphim.Hinh, rapphim.DiaChi from rapphim`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/loadphimyeuthich", function (req, res) {
  let sqlquery = `SELECT DISTINCT phim.ID,phim.TenPhim, phim.ThoiGian, phim.Hinh, phim_loaiphim.MoTa FROM phim JOIN phim_loaiphim ON phim.ID = phim_loaiphim.ID_Phim LIMIT 3`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

//phan quan trong nhat
app.get("/datvephim", function (req, res) {
  let ngaydat = req.query.ngaydat;
  let idsuat = req.query.idsuat;
  let idghe = req.query.idghe;
  let idphim = req.query.idphim;
  let idkhachhang = req.query.idkhachhang;
  let idrap = req.query.idrap;
  let status = req.query.status;
  let idphong = req.query.idphong;

  let sqlqueryhoadon = `INSERT INTO hoadon  VALUES (NULL, '${ngaydat}', '45000', '${idkhachhang}', 'Chưa thanh toán');`;

  conn.query(sqlqueryhoadon, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      let sqllastrowhoadon = `SELECT * FROM hoadon ORDER BY hoadon.ID DESC LIMIT 1`;
      conn.query(sqllastrowhoadon, function (err, result) {
        let idhoadon = result[0].ID;
        let sqlquery = `INSERT INTO vedat VALUES (NULL, '${ngaydat}', '${idsuat}', '${idghe}', '${idphim}', '${idkhachhang}', '${idrap}', '${idhoadon}', '${status}', '${idphong}')`;
        conn.query(sqlquery, function (err, result) {
          if (err) {
            console.log(err);
          } else {
            res.json({ idve: result.insertId, idhd: idhoadon });
          }
        });

        let sqlquerygetghephong =
          "SELECT * FROM ghe_phong WHERE ghe_phong.ID_Ghe = ? AND ghe_phong.ID_Phong = ? AND ghe_phong.ID_suatchieu = ? AND ghe_phong.NgayDat = ?";
        conn.query(sqlquerygetghephong, [idghe, idphong, idsuat, ngaydat], function (err, result1) {
          if (err) {
            console.log(err);
          } else {
            // if (result1[0]) {
            //   let updatestatus =
            //     "UPDATE ghe_phong SET ghe_phong.TrangThai = 'Đã đặt' WHERE ghe_phong.ID_Ghe = ? AND ghe_phong.ID_Phong = ? AND ghe_phong.ID_suatchieu = ? AND ghe_phong.NgayDat = ?";
            //   conn.query(updatestatus, [idghe, idphong, idsuat, ngaydat], function (err, resultupdatestatus) {
            //     if (err) {
            //       console.log(err);
            //     } else {
            //       // console.log("thành công !");
            //     }
            //   });
            // } else {
              // let sqlqueryghephong = `INSERT INTO ghe_phong VALUES ('${idghe}', '${idphong}','${idsuat}','${status}' ,'${ngaydat}')`;
              let sqlqueryghephong = `UPDATE ghe set ghe.TrangThai = N'Đã đặt' WHERE ghe.ID = ${idghe}`;
              conn.query(sqlqueryghephong, function (err, result) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("thành công !");
                }
              });
            // }
          }
        });
      });
    }
  });
});

app.get("/capnhattrangthaidatve", function (req, res) {
  let idphong = req.query.idphong;
  let idghe = req.query.idghe;
  let ngaydat = req.query.ngaydat;
  let idsuat = req.query.idsuat;
  let idve = req.query.idve;
  let idhoadon = req.query.idhoadon;
  let queryupdatestatusve =
    "UPDATE vedat SET vedat.Status = 'Đã hủy' WHERE vedat.ID = ?";
  conn.query(queryupdatestatusve, [idve], function (err, result) {
    if (err) {
      console.log(err);
    } else {
      let queryupdatehd =
        "UPDATE hoadon SET hoadon.TrangThai = 'Đã hủy' WHERE hoadon.ID = ?";
      conn.query(queryupdatehd, [idhoadon], function (err, result) {
        if (err) {
          console.log(err);
        } else {
          let queryupdateghephong =
            `UPDATE ghe set ghe.TrangThai = N'Đã đặt' WHERE ghe.ID = ${idghe}`;
          conn.query(
            queryupdateghephong,
            function (err, result) {
              if (err) {
                console.log(err);
              } else {
                res.send("ABC");
              }
            }
          );
        }
      });
    }
  });
});

app.get("/loadxuatchieu", function (req, res) {
  let idphim = req.query.idphim;
  let idrap = req.query.idrap;
  let ngayhientai = req.query.ngayhientai;
  let sqlquery = `SELECT phim_phong_xuat.Ngay, suatchieu.ID, suatchieu.Gio from phim_phong_xuat JOIN suatchieu ON phim_phong_xuat.ID_XuatChieu = suatchieu.ID JOIN lichchieu on lichchieu.ID = suatchieu.ID_LichChieu JOIN rapphim on rapphim.ID = lichchieu.ID_Rap JOIN phim ON phim_phong_xuat.ID_Phim = phim.ID
                  WHERE rapphim.ID = ${idrap} AND phim.ID = ${idphim} AND lichchieu.Ngay = '${ngayhientai}'`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/loadve", function (req, res) {
  let thoigianhientai =  req.query.thoigianhientai;
  let ngayhientai = req.query.ngayhientai;
  let iduser = req.query.iduser;
  let sqlquery = `SELECT phong.TenPhong, vedat.Status, rapphim.DiaChi, phim.Hinh, phim.ThoiGian, vedat.ID, rapphim.TenRap, phim.TenPhim , DATE_FORMAT(vedat.NgayDat, '%d/%m/%Y') as NgayDat, ghe.TenGhe, suatchieu.Gio
              FROM vedat JOIN phim ON phim.ID = vedat.ID_Phim JOIN suatchieu ON suatchieu.ID = vedat.ID_Suat JOIN ghe on ghe.ID = vedat.ID_Ghe JOIN khachhang ON khachhang.ID = vedat.ID_KhachHang JOIN  rapphim ON rapphim.ID = vedat.ID_Rap JOIN phong ON phong.ID = vedat.ID_Phong
              WHERE suatchieu.Gio >= '${thoigianhientai}' AND vedat.NgayDat >=  DATE('${ngayhientai}') AND vedat.Status = N'Đã đặt' AND khachhang.ID = ${iduser}`;

  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/loadallghe", function(req, res){
  let idphong = req.query.idphong;
  let sqlquery = `SELECT * FROM ghe WHERE ghe.ID_Phong = ?`;
  conn.query(sqlquery,[idphong],function(err , result){
    if(err){
      console.log(err);
    }else{
      res.json(result);
    }
  })
})

app.put("/loadghe", function (req, res) {
  // let rapphim = req.query.rapphim;
  // let idphim = req.query.idphim;
  // let suatchieu = req.query.suatchieu;
  // let ngaydathientai = req.query.ngaydathientai;
  let rapphim = req.body.rapphim;
  let idphim = req.body.idphim;
  let idsuatchieu = req.body.idsuatchieu;
  let ngaydathientai = req.body.ngaydathientai;
  let idphong = req.body.idphong;
  // let sqlquery = `SELECT ghe.ID, phim.TenPhim, ghe.TenGhe, ghe_phong.TrangThai 
  //                 FROM ghe JOIN ghe_phong ON ghe.ID = ghe_phong.ID_Ghe JOIN phong ON phong.ID = ghe_phong.ID_Phong JOIN suatchieu ON suatchieu.ID = ghe_phong.ID_suatchieu JOIN phong_rap ON phong_rap.ID_Phong = phong.ID JOIN rapphim ON rapphim.ID = phong_rap.ID_Rap JOIN phim_phong_xuat ON phim_phong_xuat.ID_XuatChieu = suatchieu.ID JOIN phim ON phim.ID = phim_phong_xuat.ID_Phim JOIN lichchieu ON lichchieu.ID_Rap = rapphim.ID 
  //                 WHERE phim.ID = ${idphim} AND suatchieu.ID = '${suatchieu}' AND rapphim.ID = ${rapphim} AND ghe_phong.NgayDat ='${ngaydathientai}' AND lichchieu.Ngay = '${ngaydathientai}'`;
  // let sqlquery = `SELECT ghe.ID, phim.TenPhim, ghe.TenGhe, ghe.TrangThai 
  //           FROM ghe JOIN phong on phong.ID = ghe.ID_Phong JOIN rapphim ON phong.ID_Rap = rapphim.ID JOIN phim_phong_xuat on phim_phong_xuat.ID_Phong = phong.ID JOIN phim on phim_phong_xuat.ID_Phim = phim.ID JOIN suatchieu ON suatchieu.ID = phim_phong_xuat.ID_XuatChieu JOIN phong_lichchieu on phong_lichchieu.ID_Phong = phong.ID JOIN
  //           lichchieu ON lichchieu.ID = phong_lichchieu.ID_LichChieu
  //           WHERE phim.ID = ${idphim} AND suatchieu.ID = ${idsuatchieu} AND rapphim.ID = ${rapphim} AND lichchieu.Ngay = '${ngaydathientai}' AND phong.ID = ${idphong} AND ghe.TrangThai = N'Đã đặt'`
  let sqlquery = `SELECT ghe.ID, phim.TenPhim, ghe.TenGhe, ghe.TrangThai 
                  FROM lichchieu JOIN rapphim ON lichchieu.ID_Rap = rapphim.ID JOIN phong ON phong.ID_Rap = rapphim.ID JOIN ghe ON ghe.ID_Phong = phong.ID JOIN phim_phong_xuat ON phim_phong_xuat.ID_Phong = phong.ID JOIN phim ON phim_phong_xuat.ID_Phim = phim.ID JOIN suatchieu ON phim_phong_xuat.ID_XuatChieu = suatchieu.ID 
                  WHERE phim.ID = ${idphim} AND suatchieu.ID = ${idsuatchieu} AND rapphim.ID = ${rapphim} AND lichchieu.Ngay = '${ngaydathientai}' AND phong.ID = ${idphong} AND ghe.TrangThai = N'Đã đặt'`
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/loadphong", function (req, res) {
  let idsuatchieu = req.query.suatchieu;
  let idphim = req.query.idphim;
  let idrap = req.query.idrap;
  let ngayhientai = req.query.ngayhientai;
  // let sqlquery = `SELECT suatchieu.Gio,phong.ID,phong.TenPhong 
  //                 FROM phong JOIN rapphim on phong.ID_Rap = rapphim.ID JOIN phim_phong_xuat ON phim_phong_xuat.ID_Phong = phong.ID JOIN phong_lichchieu on phong.ID = phong_lichchieu.ID_Phong JOIN lichchieu ON lichchieu.ID = phong_lichchieu.ID_LichChieu JOIN suatchieu ON phim_phong_xuat.ID_XuatChieu = suatchieu.ID 
  //                 WHERE lichchieu.Ngay = '${ngayhientai}' AND rapphim.ID = ${idrap} AND phim_phong_xuat.ID_Phim = ${idphim} AND suatchieu.ID = ${idsuatchieu}`
  let sqlquery = `SELECT suatchieu.Gio,phong.ID,phong.TenPhong 
                  FROM lichchieu JOIN rapphim ON lichchieu.ID_Rap = rapphim.ID JOIN phong on phong.ID_Rap = rapphim.ID JOIN phim_phong_xuat ON phim_phong_xuat.ID_Phong = phong.ID JOIN phim ON phim_phong_xuat.ID_Phim = phim.ID JOIN suatchieu ON phim_phong_xuat.ID_XuatChieu = suatchieu.ID 
                  WHERE lichchieu.Ngay = '${ngayhientai}' AND rapphim.ID = ${idrap} AND phim_phong_xuat.ID_Phim = ${idphim} AND suatchieu.ID = ${idsuatchieu}`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.post("/capnhatthongtinkhach", function (req, res) {
  let hoten = req.body.HoTen;
  let email = req.body.Email;
  let ngaysinh = req.body.NgaySinh;
  let sodienthoai = req.body.SDT;
  let idkhachhang = req.body.ID;
  let sqlquery = `UPDATE khachhang 
                  SET khachhang.HoTen = ? , khachhang.Email = ?, khachhang.NgaySinh = ?, khachhang.SDT = ? 
                  WHERE khachhang.ID = ?`;

  conn.query(sqlquery, [hoten, email, ngaysinh, sodienthoai, idkhachhang] ,function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send({
        ID: result.insertId,
        HoTen: hoten,
        Email: email,
        NgaySinh: ngaysinh,
        SDT: sodienthoai,
        Account: '',
        Password: '',
      });
    }
  });
});

app.post("/updatepassuser", function (req, res) {
  let makhachhang = req.body.makhachhang;
  let newpass = req.body.newpass;
  let sqlquery =
    "UPDATE khachhang SET khachhang.Password = ? WHERE khachhang.ID = ?";
  conn.query(sqlquery, [newpass, makhachhang], function (err, result) {
    if (err) {
      console.log(err);
      // res.json({ status: "That Bai!" });
    } else {
      res.json({
        ID: result.insertId,
        HoTen: '',
        Email: '',
        NgaySinh: '',
        SDT: '',
        Account: '',
        Password: '',
      });
    }
  });
});

//#endregion

//#region Phần Server

//Movie
app.get("/loadphimadmin", function (req, res) {
  let vitri = req.query.vitri;
  let query = `SELECT phim.ID, phim.TenPhim, phim.Hinh, phim.TrangThai, phim.ThoiGian, phim.Trailer, phim_loaiphim.MoTa, DATE_FORMAT(phim_loaiphim.NgayKhoiChieu, '%d/%m/%Y') as 'NgayKhoiChieu' FROM phim JOIN phim_loaiphim ON phim.ID = phim_loaiphim.ID_Phim Limit ${vitri}, 5`;
  conn.query(query, function (err, result) {
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
});
app.get("/timkiemmovieadmin", function (req, res) {
  let tenphim = req.query.tenphim;
  let sqlquery = `SELECT * FROM phim WHERE phim.TenPhim LIKE N'%${tenphim}%'`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.post("/updatemovie", function (req, res) {
  let maphim = req.body.maphim;
  let tenphim = req.body.tenphim;
  let hinhphim = req.body.hinhphim;
  let trangthai = req.body.trangthai;
  let thoigian = req.body.thoigian;
  let idtrailer = req.body.idtrailer;
  let mota = req.body.mota;

  let sqlquery = `UPDATE phim
  SET phim.TenPhim = N'${tenphim}', phim.Hinh = '${hinhphim}', phim.TrangThai = N'${trangthai}', phim.ThoiGian = ${thoigian}, phim.Trailer = '${idtrailer}'
  WHERE phim.ID = ${maphim}`;

  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send("Cập nhật thành công !");
    }
  });
});

app.post("/insertnewmovieadmin", function (req, res) {
  let tenphim = req.body.tenphim;
  let hinhphim = req.body.hinhphim;
  let trangthai = req.body.trangthai;
  let thoigian = req.body.thoigian;
  let idtrailer = req.body.idtrailer;
  let mota = req.body.mota;
  let ngaykhoichieu = req.body.ngaykhoichieu;
  let arrloaiphim = JSON.parse(req.body.arrloaiphim);
  let sqlquery = `INSERT INTO phim VALUES(NULL,'${tenphim}','${hinhphim}','${trangthai}','${thoigian}','${idtrailer}')`;

  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      console.log(5);
      let idphim = result.insertId;
      console.log(idphim);
      for (let index = 0; index < arrloaiphim.length; index++) {
        let idloai = arrloaiphim[index].id;
        let queryphimloai = `INSERT INTO phim_loaiphim VALUES('${idphim}','${idloai}', '${mota}','${ngaykhoichieu}')`;
        conn.query(queryphimloai, function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
    }
  });
});

//

app.get("/loadloaiphimadmin", function (req, res) {
  let sqlquery = `Select * from loaiphim`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.post("/deletemovieadmin", function (req, res) {
  let idphim = req.body.idphim;
  let sqlquery = `DELETE FROM phim WHERE phim.ID = ${idphim}`;
  conn.query(sqlquery, function (err, result) {
    console.log(result);
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});

//Customer
app.get("/loadcustomeradmin", function (req, res) {
  let vitri = req.query.vitri;
  let sqlquery = `SELECT khachhang.ID, khachhang.HoTen, khachhang.Email, DATE_FORMAT(khachhang.NgaySinh, '%d/%m/%Y') as 'NgaySinh', khachhang.SDT from khachhang Limit ${vitri}, 5`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

app.get("/timkiemcustomer", function (req, res) {
  let tencustomer = req.query.tencustomer;
  let sqlquery = `SELECT khachhang.ID, khachhang.HoTen, khachhang.Email, DATE_FORMAT(khachhang.NgaySinh, '%d/%m/%Y') as 'NgaySinh', khachhang.SDT FROM khachhang WHERE khachhang.HoTen LIKE '%${tencustomer}%'`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});
//Cinema
app.get("/loadcinemaadmin", function (req, res) {
  let vitri = req.query.vitri;
  let strquery = `SELECT * FROM rapphim Limit ${vitri}, 5`;
  conn.query(strquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});
app.post("/updatcinemaadmin", function (req, res) {
  let idcinema = req.body.idcinema;
  let tencinema = req.body.tencinema;
  let hinhcinema = req.body.hinhcinema;
  let diachicinema = req.body.diachicinema;
  let sqlquery = `UPDATE rapphim
  SET rapphim.TenRap = '${tencinema}', rapphim.Hinh = '${hinhcinema}', rapphim.DiaChi = '${diachicinema}'
  WHERE rapphim.ID = '${idcinema}'`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send("Cap nhat thanh cong! ");
    }
  });
});

app.post("/insertnewcinemaadmin", function (req, res) {
  let tencinema = req.body.tencinema;
  let hinhcinema = req.body.hinhcinema;
  let diachicinema = req.body.diachicinema;
  let sqlquery = `INSERT INTO rapphim VALUES(NULL, '${tencinema}', '${hinhcinema}', '${diachicinema}')`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
      console.log(err);
    } else {
      res.send("Them thanh cong !");
    }
  });
});
app.get("/timkiemcinemaadmin", function (req, res) {
  let tencinema = req.query.tencinema;
  let sqlquery = `SELECT * FROM rapphim WHERE rapphim.TenRap LIKE '%${tencinema}%'`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});
//Ticker
app.get("/loadtickeradmin", function (req, res) {
  let vitri = req.query.vitri;
  let sqlquery = `SELECT vedat.ID, vedat.NgayDat, DATE_FORMAT(suatchieu.Gio, '%H:%i') as 'Gio', ghe.TenGhe, phim.TenPhim, khachhang.HoTen, rapphim.TenRap, phong.TenPhong, vedat.Status FROM vedat JOIN suatchieu ON vedat.ID_Suat = suatchieu.ID JOIN ghe ON ghe.ID = vedat.ID_Ghe JOIN phim ON phim.ID = vedat.ID_Phim JOIN khachhang ON khachhang.ID = vedat.ID_KhachHang JOIN rapphim ON rapphim.ID = vedat.ID_Rap JOIN phong ON phong.ID = vedat.ID_Phong Limit ${vitri}, 5`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});
//Lich chieu
app.get("/searchscheduleadmin", function (req, res) {
  let ngay = req.query.ngay;
  let query = `SELECT lichchieu.ID, DATE_FORMAT(lichchieu.Ngay, '%d/%m/%Y') as 'Ngay', rapphim.ID as 'IDRapPhim', rapphim.TenRap FROM lichchieu JOIN rapphim ON lichchieu.ID_Rap = rapphim.ID WHERE lichchieu.Ngay = '${ngay}'`;
  conn.query(query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});
app.get("/loadlichchieuadmin", function (req, res) {
  let vitri = req.query.vitri;
  let sqlquery = `SELECT lichchieu.ID, DATE_FORMAT(lichchieu.Ngay, '%d/%m/%Y') as 'Ngay', rapphim.ID as 'IDRapPhim', rapphim.TenRap FROM lichchieu JOIN rapphim ON lichchieu.ID_Rap = rapphim.ID Limit ${vitri}, 5`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});
app.get("/loadchitietlichchieuadmin", function (req, res) {
  let idrap = req.query.idrap;
  let ngay = req.query.ngay;
  let sqlquery = `SELECT phim.Hinh,suatchieu.ID as 'IdSuatChieu', suatchieu.Gio, phim.TenPhim, phim.ID from phim_phong_xuat JOIN suatchieu ON phim_phong_xuat.ID_XuatChieu = suatchieu.ID JOIN lichchieu on lichchieu.ID = suatchieu.ID_LichChieu JOIN rapphim on rapphim.ID = lichchieu.ID_Rap JOIN phim ON phim_phong_xuat.ID_Phim = phim.ID WHERE rapphim.ID = ${idrap} AND lichchieu.Ngay = '${ngay}' AND phim_phong_xuat.Ngay = '${ngay}'`;
  conn.query(sqlquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      let arrtemp = [];
      let arrrs = [];
      let namemovie = "";
      if (result.length == 1) {
        arrtemp.push({ idsuat: result[0].ID, gio: result[0].Gio });
        arrrs.push(result[0]);
        arrrs[0].suatchieu = arrtemp;
      } else {
        for (let i = 0; i < result.length; i++) {
          let temp = result[i];
          if (temp.TenPhim != namemovie) {
            for (let j = i + 1; j < result.length; j++) {
              if (temp.TenPhim == result[j].TenPhim) {
                arrtemp.push({
                  idsuat: result[j].IdSuatChieu,
                  gio: result[j].Gio,
                });
              }
            }
            arrtemp.unshift({ idsuat: temp.IdSuatChieu, gio: temp.Gio });
            temp.suatchieu = arrtemp.slice();
            namemovie = temp.TenPhim;
            arrrs.push(temp);
            arrtemp.length = 0;
          }
        }
      }
      res.json(arrrs);
    }
  });
});

app.post("/xeplich", function (req, res) {
  let idrapphim = req.body.idrapphim;
  let ngay = req.body.ngay;
  let gio = req.body.gio;
  let idphong = req.body.idphong;
  let idphim = req.body.idphim;

  let querylichchieu = `INSERT INTO lichchieu VALUES (NULL, '${ngay}', '${idrapphim}')`;
  conn.query(querylichchieu, function (err, resultlichchieu) {
    if (err) {
      console.log(err);
    } else {
      let querysuatchieu = `INSERT INTO suatchieu VALUES (NULL, '${gio}', '${resultlichchieu.insertId}')`;
      conn.query(querysuatchieu, function (err, reultsuatchieu) {
        if (err) {
          console.log(err);
        } else {
          let queryphonglichchieu = `INSERT INTO phong_lichchieu VALUES('${idphong}', '${resultlichchieu.insertId}')`;
          conn.query(queryphonglichchieu, function (err, result) {
            if (err) {
              console.log(err);
            } else {
              let queryphimphongsuat = `INSERT INTO phim_phong_xuat VALUES('${idphim}','${idphong}','${reultsuatchieu.insertId}','${ngay}')`;
              conn.query(queryphimphongsuat, function (err, result) {
                if (err) {
                  console.log(err);
                } else {
                  let queryphonglichchieu = `INSERT INTO phim_lichchieu VALUES('${idphong}','${resultlichchieu.insertId}')`;
                  conn.query(queryphonglichchieu, function (err, result) {
                    if (err) {
                      console.log(err);
                    } else {
                      res.send("Thanh cong !");
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});
//phong
app.get("/loadphongadmin", function (req, res) {
  let sqlquery = `select * from phong`;
  conn.query(sqlquery, function (err, results) {
    if (err) {
      console.log(err);
    } else {
      res.json(results);
    }
  });
});

app.post("/loginadmin", function (req, res) {
  let account = req.body.account;
  let password = req.body.password;
  let query = `SELECT Admin.ID, Admin.HoTen FROM Admin WHERE Admin.Acount = ? AND Admin.Password = ?`;
  conn.query(query, [account, password], function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});
//Tạm
app.get("/loadcinemascheduleadmin", function (req, res) {
  let strquery = `SELECT * FROM rapphim`;
  conn.query(strquery, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});
// load phong
app.get("/loadphongscheduleadmin", function (req, res) {
  let sqlquery = `select * from phong`;
  conn.query(sqlquery, function (err, results) {
    if (err) {
      console.log(err);
    } else {
      res.json(results);
    }
  });
});
// load phim
app.get("/loadphimscheduleadmin", function (req, res) {
  let sqlquery = `select * from phim`;
  conn.query(sqlquery, function (err, results) {
    if (err) {
      console.log(err);
    } else {
      res.json(results);
    }
  });
});
//#endregion

// LIMIT ${vitri},${soluong}
// LIMIT ${vitribatdau},3
// GET, POST -> sử dụng query
