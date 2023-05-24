const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const heading = $("header h2");
const cdThumb = $(".cd img");
const audio = $("#audio");
const playMusic = $(".btn-play");
const player = $(".player");
const timeStart = $(".time-start");
const timeEnd = $(".time-end");
const progress = $("#progress");
const progressSound = $(".ip-sound");
const btnRepeat = $(".btn-repeat");
const btnPrev = $(".btn-prev");
const btnNext = $(".btn-next");
const btnRandom = $(".btn-random");
const playList = $(".playlist");
const soundSong = $(".sound");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  numVolume: 1,
  // khi chưa lưu gì thì setting sẽ là một obj
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  songs: [
    {
      name: "Khuất lối",
      singer: "H-kray",
      path: "./assets/music/khuatloi.mp3",
      image: "./assets/img/khuatloi.jpg",
    },
    {
      name: "Lỡ yêu người đậm sâu",
      singer: "H-kray",
      path: "./assets/music/loyeunguoidamsau.mp3",
      image: "./assets/img/loyeunguoidamsau.jpg",
    },
    {
      name: "Lý do là gì",
      singer: "H-kray",
      path: "./assets/music/lydolagi.mp3",
      image: "./assets/img/lydolagi.jpg",
    },
    {
      name: "Người ta",
      singer: "H-kray",
      path: "./assets/music/nguoita.mp3",
      image: "./assets/img/nguoita.jpg",
    },
    {
      name: "Phút chia lìa",
      singer: "H-kray",
      path: "./assets/music/phutchialia.mp3",
      image: "./assets/img/phutchialia.jpg",
    },
    {
      name: "Quay lưng",
      singer: "H-kray",
      path: "./assets/music/quaylung.mp3",
      image: "./assets/img/quaylung.jpg",
    },
    {
      name: "Sao cũng được",
      singer: "H-kray",
      path: "./assets/music/saocungduoc.mp3",
      image: "./assets/img/saocungduoc.jpg",
    },
    {
      name: "Thế thái",
      singer: "H-kray",
      path: "./assets/music/thethai.mp3",
      image: "./assets/img/thethai.jpg",
    },
    {
      name: "Vương vấn",
      singer: "H-kray",
      path: "./assets/music/vuongvan.mp3",
      image: "./assets/img/vuongvan.jpg",
    },
    {
      name: "Chỉ vì quá yêu em",
      singer: "H-kray",
      path: "./assets/music/chiviquayeuem.mp3",
      image: "./assets/img/chiviquayeuem.jpg",
    },
  ],

  //  render bài hát ra giao diện

  render: function () {
    const html = this.songs.map((song, index) => {
      return `
            <div class="playlist-item ${
              index === this.currentIndex ? "active" : ""
            }" data-index=${index}>
                <div class="song">
                    <div class="song-image">
                        <img src="${song.image}" alt="">
                    </div>
                    <div class="song-body">
                        <h3 class="name-song">${song.name}</h3>
                        <span class="author">${song.singer}</span>
                    </div>
                </div>
                <div class="option">
                    <i class="fa-solid fa-ellipsis"></i>
                </div>
            </div>
            `;
    });
    playList.innerHTML = html.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvent: function () {
    const _this = this;

    // xử lý CD quay/ dừng
    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      { duration: 10000, iterations: Infinity }
    );
    cdThumbAnimate.pause();

    // click nút play
    playMusic.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    //khi bài hát được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    //khi bài hát bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };
    // lấy thời gian thực của audio
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
        timeEnd.innerText = _this.showTime(audio.duration);
        timeStart.innerText = _this.showTime(audio.currentTime);
      }
    };

    // hành động tua
    progress.oninput = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime - 3;
    };

    //click nút prev
    btnPrev.onclick = function () {
      if (_this.isRandom) {
        _this.playRanDom();
      } else {
        _this.nextPrev();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //click nút next
    btnNext.onclick = function () {
      if (_this.isRandom) {
        _this.playRanDom();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };
    // xử lý nút phát lại khi kết thúc bài hát
    btnRepeat.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      //lưu trạng thái của isRepeat khi ta click để load lại trang không bị mất
      _this.setConfig("isRepeat", _this.isRepeat);
      btnRepeat.classList.toggle("active", _this.isRepeat);
    };

    //xử lý random bật tắt random
    btnRandom.onclick = function () {
      _this.isRandom = !_this.isRandom;
      //lưu trạng thái của isRandom khi ta click để load lại trang không bị mất
      _this.setConfig("isRandom", _this.isRandom);
      btnRandom.classList.toggle("active", _this.isRandom);
    };

    //xử lý next song khi audio ending

    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        if (_this.isRandom) {
          _this.playRanDom();
        } else {
          _this.nextSong();
        }
      }
      audio.play();
    };
    let a = 1;
    //lắng nghe click vào playList
    playList.onclick = function (e) {
      // xử lý khi click vào bài hát
      const songNode = e.target.closest(".playlist-item:not(.active)");
      if (songNode || e.target.closest(".option")) {
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          audio.play();
          _this.render();
          _this.setConfig("currentIndex", Number(songNode.dataset.index));
        }
        if (e.target.closest(".option")) {
        }
      }
    };
    progressSound.oninput = function (e) {
      if (e.target.value == 0) {
        soundSong.classList.add("mute");
      } else {
        soundSong.classList.remove("mute");
      }
      audio.volume = e.target.value;
      _this.numVolume = audio.volume;
      _this.setConfig("numVolume", _this.numVolume);
    };

    let isSound = true;
    progressSound.value = Number(_this.numVolume);
    audio.volume = progressSound.value;
    if (audio.volume == 0) {
      soundSong.classList.add("mute");
    }
    soundSong.onclick = function (e) {
      const soundNode = e.target.closest(".icon-sound,.icon-mute");
      const progressNode = e.target.closest(".ip-sound");
      if (soundNode || progressNode)
        if (soundNode) {
          if (isSound) {
            currentSound = progressSound.value;
            isSound = false;
            audio.volume = 0;
            progressSound.value = 0;
            soundSong.classList.toggle("mute");
          } else {
            isSound = true;
            audio.volume = 1;
            progressSound.value = currentSound;
            soundSong.classList.toggle("mute");
          }
        }
      _this.numVolume = audio.volume;
      _this.setConfig("numVolume", _this.numVolume);
    };
  },
  playRanDom: function () {
    let newCurrent;
    do {
      newCurrent = Math.floor(Math.random() * this.songs.length);
    } while (newCurrent === this.currentIndex);

    this.currentIndex = newCurrent;
    this.loadCurrentSong();
  },
  // format lại thời gian
  showTime: function (seconds) {
    let minute = Math.floor(seconds / 60);
    let second = Math.floor(seconds % 60);
    minute = minute < 10 ? "0" + minute : minute;
    second = second < 10 ? "0" + second : second;
    return minute + ":" + second;
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".playlist-item.active").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
    this.currentIndex = this.config.currentIndex;
    this.numVolume = this.config.numVolume;
    this.scrollToActiveSong();
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.src = this.currentSong.image;
    audio.src = this.currentSong.path;
  },

  //function next
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  nextPrev: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  start: function () {
    //lấy giá trị đã được lưu trong config gán lại vào
    //2 biến isRepeat và isRandom khi ra load lại trang
    this.loadConfig();
    //định nghĩa các thuộc tính cho object
    this.defineProperties();

    //Lắng nghe các sự kiện (DOM Event)
    this.handleEvent();

    //tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    //render danh sách bài hát
    this.render();

    //hiển thị trạng thái ban đầu của button repeat và random
    btnRandom.classList.toggle("active", this.isRandom);
    btnRepeat.classList.toggle("active", this.isRepeat);
  },
};

app.start();
