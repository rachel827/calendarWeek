var utils = require('util.js')
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    valtime: 8,
    dateList: [], // 日历数据数组
    swiperCurrent: 0, // 日历轮播正处在哪个索引位置
    dateCurrent: new Date(), // 正选择的当前日期
    dateCurrentStr: '', // 正选择日期的 id
    dateMonth: '1月', // 正显示的月份
    dateListArray: ['日', '一', '二', '三', '四', '五', '六'],
  },
  ready: function () {
    var that = this;
    var today = utils.formatTime2(new Date());
    this.setData({
      today,
    });
    var d = new Date();
    this.initDate(-5, 2, d); // 日历组件程序 -4左表示过去4周 右1表示过去一周

  },
  /**
   * 组件的方法列表
   */
  methods: {
    tiaotime(e) {
      let data = e.detail.value.split("-")
      var d = new Date(Number(data[0]), Number(data[1]) - 1, Number(data[2]));
      this.setData({
        dateList: []
      })
      this.initDate(-5, 2, d); // 日历组件程序 -4左表示过去4周 右1表示过去一周
    },
    onShow: function (e) {
      wx.getSystemInfo({
        success: (res) => {
          this.setData({
            windowHeight: res.windowHeight,
            windowWidth: res.windowWidth,
          });
        }
      });
    },

    // 日历组件部分
    // ----------------------------
    initDate(left, right, d) {
      var month = utils.addZero(d.getMonth() + 1),
        year = utils.addZero(d.getFullYear()),
        day = utils.addZero(d.getDate());
      for (var i = left; i <= right; i++) {
        this.updateDate(utils.DateAddDay(d, i * 7));//多少天之后的
      }

      this.setData({
        swiperCurrent: 5,
        dateCurrent: d,
        dateMonth: month + '月',
        dateYear: year + '年',
        dateCurrentStr: year + "-" + month + "-" + day,
      });
    },
    // 获取这周从周一到周日的日期
    calculateDate(_date) {
      var first = utils.FirstDayInThisWeek(_date);
      var d = {
        'month': first.getMonth() + 1,
        'days': [],

      };
      let weekArr=['周一','周二','周三','周四','周五','周六','周日']
      for (var i = 0; i < 7; i++) {
        var dd = utils.DateAddDay(first, i);
        var day = utils.addZero(dd.getDate()),
          year = utils.addZero(dd.getFullYear()),
          month = utils.addZero(dd.getMonth() + 1);

        d.days.push({
          'day': day,
          'id':  month + '.' + day,
          'time':dd.getFullYear() + '-' + month + '-' + day,
          'ids': dd.getFullYear() + ',' + month + ',' + day,
          'week':weekArr[i]
        });
      }
      return d;
    },
    // 更新日期数组数据
    updateDate(_date, atBefore) {
      var week = this.calculateDate(_date);
      if (atBefore) {
        this.setData({
          dateList: [week].concat(this.data.dateList),
        });
      } else {
        this.setData({
          dateList: this.data.dateList.concat(week),
        });
      }

    },
    // 日历组件轮播切换
    dateSwiperChange(e) {
      const lastIndex = this.data.swiperCurrent
        , currentIndex = e.detail.current
        , dateList = this.data.dateList
        , dateListlen = this.data.dateList.length
      let flag = false
        , key = 'lastMonth' //判断是左划还是右
      // console.log(lastIndex , currentIndex)
      if (lastIndex > currentIndex) {
        lastIndex === 7 && currentIndex === 0
          ? flag = true
          : null

      } else {
        lastIndex === 0 && currentIndex === 7
          ? null
          : flag = true
      }
      if (flag) {
        key = 'nextMonth'
      }
      if (key == 'lastMonth') {
        let nowindex = currentIndex - 3;
        let uptime = currentIndex - 4;
        let a = 0;
        if (nowindex < 0) { nowindex = nowindex + 8; a = 0 }
        if (uptime < 0) { uptime = uptime + 8 }

        let seltime = dateList[nowindex].days[a].ids
        var week = this.calculateDate(utils.formatTime(utils.DateAddDay(seltime, -1)));

        dateList[uptime] = week
        this.setData({
          dateList: dateList
        })

      }
      if (key == 'nextMonth') {
        let indexne = 0
        let aa = 0
        if (currentIndex == 7) { //要更新的下标
          indexne = 0
          aa = 1
        } else {
          indexne = currentIndex + 1
          aa = currentIndex + 2
        }
        if (aa == 8) {
          aa = 0
        }
        //aa 要更新的数组下标 datanex要往后查询一周的日期
        let datanex = dateList[indexne].days[6].ids
        //获取下一周的
        var week = this.calculateDate(utils.formatTime(utils.DateAddDay(datanex, 1)));
        dateList[aa] = week

        this.setData({
          dateList: dateList
        })
      }

      var d = this.data.dateList[currentIndex];
      let da = new Date(d.days[0].ids)
      this.setData({
        swiperCurrent: currentIndex,
        dateMonth: d.month + '月',
        dateYear: da.getFullYear()+"年"
      })

    },
    // 获得日期字符串
    getDateStr: function (arg) {
      if (utils.type(arg) == 'array') {
        return arr[0] + '-' + arr[1] + '-' + arr[2] + ' 00:00:00';
      } else if (utils.type(arg) == 'date') {
        return arg.getFullYear() + '-' + (arg.getMonth() + 1) + '-' + arg.getDate() + ' 00:00:00';
      } else if (utils.type(arg) == 'object') {
        return arg.year + '-' + arg.month + '-' + arg.day + ' 00:00:00';
      }
    },

    // 点击日历某日
    chooseDate(e) {
      var str = e.currentTarget.dataset.time;
      // console.log(str);
      this.setData({ dateCurrentStr: str });
      this.triggerEvent('mydata', { data: str })
    },
  }
})