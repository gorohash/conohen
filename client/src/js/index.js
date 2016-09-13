function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 35.6786466953, lng: 139.7673965155 },
    zoom: 20,
  });
  const infoWindow = new google.maps.InfoWindow({ map: map });

  // Try HTML5 geolocation.
  let pos;
  let marker;
  let move = false;
  const infoWindows = [];

  for(let i=0; i<10; i++){
    infoWindows.push(
      new google.maps.InfoWindow({
        content: '',
        disableAutoPan: true,
      })
    );
  }
  infoWindows.push(
    new google.maps.InfoWindow({
      content: '<a href="http://www.recruit.jp/"><img src="https://lh3.googleusercontent.com/gyTZjgdvHrgLtU0kIlTmSQdjMLUYeJtC3n0MbxxjDWJn4AITzOHEUFY173FIWFJRHs4" width="70" height="70"></a>',
      disableAutoPan: true,
      position: { lat: 35.6786758, lng: 139.7675861 },
    })
  );
  infoWindows[infoWindows.length - 1].open(map);


  $('#move').on('click', () => {
    move = move ? false : true;
    if (move) {
      pos = {
        lat: 35.658517,
        lng: 139.70133399999997
      };
    }
  });

  let atFirst = true;
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(position => {
      if (move) {
        pos = {
          lat: 35.658517,
          lng: 139.70133399999997
        };
      } else {
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      }

      if (atFirst) {
        marker = new google.maps.Marker({
          position: pos,
          map: map,
          title: 'Here!'
        });

        setInterval(() => {
          marker.setPosition(pos);
          map.setCenter(pos);
          $.getJSON(
            "https://afternoon-caverns-24273.herokuapp.com/hot_pepper",
            {
              lat: pos.lat,
              lng: pos.lng,
              range: 1
            },
            (dataset) => {
              dataset.results.shop.map((shop, key) => {
                infoWindows[key].setOptions({
                  content:
                    `<div>
                      <a href="${shop.urls.pc}">
                        <img src="${shop.photo.mobile.s}">
                      </a>
                    </div>`,
                  position: { lat: +shop.lat, lng: +shop.lng },
                });
                infoWindows[key].open(map);
              })
            }
          )
        }, 10000);
        atFirst = false;
      }
    }, () => handleLocationError(true, infoWindow, map.getCenter()), {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  const reader = new FileReader();
  reader.addEventListener('load', function(){
    infoWindows.push(
      new google.maps.InfoWindow({
        content: `<img src="${reader.result}" width="70" height="70">`,
        position: pos,
      })
    );
    infoWindows[infoWindows.length - 1].open(map);
  });

  $('#file').change((e) => {
    if (e.target.files[0].type.match(/image/)){
      reader.readAsDataURL(e.target.files[0]);
    }
    $('#bottom-left').css('display', 'none');
  });

  $('#plus').on('click', () => {
    $('#bottom-left').css('display', 'block');
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.'
  );
}
