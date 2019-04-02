require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/widgets/BasemapGallery",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
  "esri/geometry/SpatialReference",
  "esri/widgets/Home",
  "esri/widgets/Expand",
  "esri/widgets/Locate",
  "esri/layers/MapImageLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/TileLayer",
  "esri/widgets/LayerList",
  "esri/tasks/IdentifyTask",
  "esri/tasks/support/IdentifyParameters",
  "esri/widgets/Search",
  "esri/layers/ImageryLayer"
  ],
  function(
    Map, SceneView, GraphicsLayer, Graphic, BasemapGallery, QueryTask, Query,
    SpatialReference, Home, Expand, Locate, MapImageLayer, FeatureLayer, TileLayer,
    LayerList, IdentifyTask, IdentifyParameters, Search,ImageryLayer
  ) {
    var peaksUrl, map, view, locateBtn, resultsLayer, crimeExpand,
        basemapGallery, bgExpand, popupTemplate, homeWidget, tileLayer, tileLayer2,
        identifyTask, params, akkolUrl, aeroAkkolUrl, adressUrl, searchWidget;

    // Сервер с данными преступлений
    akkolUrl ="http://gisapp1.3dmap.kz/server/rest/services/AkkolDidar/AkkolLayers/MapServer"
    aeroAkkolUrl = "https://gisapp1.3dmap.kz/server/rest/services/Map/AkkolRas/ImageServer"
    peaksUrl = "http://infopublic.pravstat.kz:8399/arcgis/rest/services/stat/MapServer/5";
    adressUrl = "https://gisapp1.3dmap.kz/server/rest/services/AkkolDidar/Adress/FeatureServer/0";

    tileLayer = new MapImageLayer({
      url: akkolUrl,
      title: "Векторный слой г.Акколь",
    });
    tileLayer2 = new ImageryLayer({
      url: aeroAkkolUrl,
      title: "Аэро-фото снимок г.Акколь"
    });

    // Карта
    map = new Map({
      basemap: "dark-gray", //dark-gray //hybrid //satellite
      ground: "world-elevation",
      layers: [tileLayer2, tileLayer]
    });

    // Карта 3D
    view = new SceneView({
      container: "viewDiv",
      map: map,
      viewingMode: "global",
      logo: false,
      popup: {
        dockEnabled: true,
        dockOptions: {
          position: "top-right",
          breakpoint: false
        }
      },
      camera: {
        position: {
          x: 70.952948,
          y: 51.995855,
          z: 15000
        },
        heading: 0,
        tilt: 0
      }
     //51.995855, 70.952948
    });
    //43.194992, 76.926290

    // Добавление слоев
    resultsLayer = new GraphicsLayer({
      visible: true,
      title: "Преступность г.Акколь"
    });

    view.ui.add("topLeft", "top-left");

    // Кнопка для преступлений
    crimeExpand = new Expand({
      expandIconClass: "esri-icon-notice-triangle",
      view: view,
      expanded: false,
      content:
        "<div class='form-style-10' id='optionsDiv'>"+
          "<h1>Криминогенная обстановка</h1>"+
          "<form>"+
            "<div class='section'><span>1</span>Выберите период</div>"+
            "<div class='inner-wrap'>"+
              "<label>Месяц"+
                "<select name='elemId' id='elemId'>"+
                  "<option value='01'>Январь</option>"+
                  "<option value='02'>Февраль</option>"+
                  "<option value='03'>Март</option>"+
                  "<option value='04'>Апрель</option>"+
                  "<option value='05'>Май</option>"+
                  "<option value='06'>Июнь</option>"+
                  "<option value='07'>Июль</option>"+
                  "<option value='09'>Август</option>"+
                  "<option value='08'>Сентябрь</option>"+
                  "<option value='10'>Октябрь</option>"+
                  "<option value='11'>Ноябрь</option>"+
                  "<option value='12'>Декабрь</option>"+
                "</select>"+
              "</label>"+
              "<label>год"+
                "<input id='yrspin' type='number' min='2014' step='1' value='2019'>"+
              "</label>"+
              "<input type='checkbox' id='scales' name='scales' checked>"+
              "<label for='scales'>С начало года</label>"+
            "</div>"+
            "<div class='section'><span>2</span>Выберите тяжесть преступления</div>"+
            "<div class='inner-wrap'>"+
              "<label>Тяжесть"+
                "<select name='hardId' id='hardId'>"+
                  "<option value='0'>Все</option>"+
                  "<option value='1'>небольшой тяжести</option>"+
                  "<option value='2'>средней тяжести</option>"+
                  "<option value='3'>тяжкие</option>"+
                  "<option value='4'>особо тяжкие</option>"+
                "</select>"+
              "</label>"+
            "</div>"+
            "<div style='padding-top: 5px;'>"+
              "<button type='button' class='button1' id='doBtn'>Показать</button>"+
              "<button type='button' class='button2' id='clearBtn'>Очистить</button>"+
            "</div>"+
            "<p id='printResults'></p>"+
          "</form>"+
        "</div>"
    });
    view.ui.add(crimeExpand, "bottom-right");

    // Базовые карты
    basemapGallery = new BasemapGallery({
      view: view,
      container: document.createElement("div")
    });

    // Кнопка для базовых карт
    bgExpand = new Expand({
      view: view,
      content: basemapGallery.container,
      expandIconClass: "esri-icon-basemap"
    });
    view.ui.add(bgExpand, "top-right");

    // Местоположение
    locateBtn = new Locate({
      view: view
    });
    view.ui.add(locateBtn, "top-left");

    // Вид карты по умолчанию
    homeWidget = new Home({
      view: view
    });
    view.ui.add(homeWidget, "top-left");

    // Вывод Слоев
    var layerList = new LayerList({
      view: view,
	    container: document.createElement("div"),
      listItemCreatedFunction: function(event) {
        const item = event.item;
        // if (item.layer.title == "Объекты города" || item.layer.title == "Криминальные происшествия в 2018 году"
        //  || item.layer.title == "Тепловая карта криминогенной обстановки в 2018 году" ) { // don't show legend twice
        if(item.layer.title == "Векторный слой г.Акколь" || item.layer.title == "Аэро-фото снимок г.Акколь"
          || item.layer.title == "Преступность г.Акколь"){
          if(item.layer.title == "Векторный слой г.Акколь" || item.layer.title == "Преступность г.Акколь"){
            item.panel = {
              content: "legend",
              open: false
            };
          }
          item.actionsSections = [
            [{
              title: "Ссылка на сервис",
              className: "esri-icon-description",
              id: "information"
            },{
              title: "Уменьшить прозрачность",
              className: "esri-icon-up",
              id: "increase-opacity"
            }, {
              title: "Увеличить прозрачность",
              className: "esri-icon-down",
              id: "decrease-opacity"
            }]
          ];
        }
      }
    });
    // }, "layer_content");
    //view.ui.add(layerList, "top-right");
	  //
    var layerListExpand = new Expand({
      view: view,
      content: layerList.container,
      expandIconClass: "esri-icon-layers",
	    expanded: false
    });
    view.ui.add(layerListExpand, "bottom-left");

    // При нажатии на кнопки в LayerList
    layerList.on("trigger-action", function(event){
      // Capture the action id.
      var id = event.action.id;

      if (id === "information") {

        // if the information action is triggered, then
        // open the item details page of the service layer
        window.open(event.item.layer.url);

      } else if (id === "increase-opacity") {

        // if the increase-opacity action is triggered, then
        // increase the opacity of the GroupLayer by 0.25

        if (event.item.layer.opacity < 1) {
          event.item.layer.opacity += 0.25;
        }
      } else if (id === "decrease-opacity") {

        // if the decrease-opacity action is triggered, then
        // decrease the opacity of the GroupLayer by 0.25

        if (event.item.layer.opacity > 0.25) {
          event.item.layer.opacity -= 0.25;
        }
      }
    });

    // Добавление на карту Поиск
    searchWidget = new Search({
      view: view,
      allPlaceholder: "Здания и сооружения",
      includeDefaultSources: false,
      sources: [{
        featureLayer: {
          url: adressUrl,
          popupTemplate:{
            title: "Здания и сооружения",
            overwriteActions: true,
            content:[{
              type: "fields",
              fieldInfos:[{
                fieldName: "full_",
                label: "Полный адрес:",
                visible: true
              },{
                fieldName: "name",
                label: "Название:",
                visible: true
              },{
                fieldName: "adress",
                label: "Адрес:",
                visible: true
              }]
            }]
          }
        },
        searchFields: ["full_"],
        displayField: "full_",
        exactMatch: false,
        outFields: ["full_", "name", "adress"],
        name: "Здание и сооружения",
        placeholder: "Введите адрес",
        autoNavigate: true,
        zoomScale: 60000
      }]
    }, "search");

    // После загрузки карты
    view.when(function() {
      var main_loading = document.getElementById("main_loading");
      var onClickLoader = document.getElementById("onClickLoader");
      crimeExpand.expanded = true;
      layerListExpand.expanded = true;
      var printResults = document.getElementById("printResults");
      var doBtn = document.getElementById("doBtn");
      var clearBtn = document.getElementById("clearBtn");

      // Показать
      main_loading.style.display = 'none';

      // При нажатии
      doBtn.addEventListener("click", doQuery);
      clearBtn.addEventListener("click", clearAll);

      // Чистка слоя
      function clearAll() {
        resultsLayer.removeAll();
        printResults.style.display = "none";
        printResults.innerHTML = "";
      };

      // Запрос
      function doQuery() {
        onClickLoader.style.display = 'inline-block';
        var qTask, query, sel_month, sel_yr, opt, hard_opt, sqlText;
        qTask = new QueryTask({
          url: peaksUrl
        });

        query = new Query({
          outFields: ["HARD_CODE,CRIME_CODE,DAT_SOVER_STR,STAT,ORGAN,UD,FZ1R18P5,FZ1R18P6"],
          geometry: view.extent,
          spatialRelationship: "intersects",
          outSpatialReference: new SpatialReference(102100),
          returnGeometry: true,
        });

        sel_month = document.getElementById("elemId").value;
        sel_yr = document.getElementById("yrspin").value;
        opt = document.getElementById("scales").value;
        hard_opt = document.getElementById("hardId").value;
        sqlText = "";

        if (document.getElementById("scales").checked == true){
          sqlText = "(PERIOD>='01' AND PERIOD<='" + sel_month + "') AND YR=" + sel_yr;
        }else {
          sqlText = "PERIOD=" + sel_month + " AND YR=" + sel_yr;
        };
        if (hard_opt != 0){
            sqlText = sqlText + " AND HARD_CODE=" + hard_opt;
        };

        resultsLayer.removeAll();
        printResults.innerHTML = "";
        printResults.style.display = "none";
        query.where = sqlText;

        qTask.execute(query)
          .then(getResults)
          .catch(promiseRejected);

        function promiseRejected(error){
          onClickLoader.style.display = 'none';
          map.remove(resultsLayer);
          console.log("Ошибка: ", error.message);
        };

        function getResults(response){
          var peakResults = response.features.map(function(point) {
            point.symbol = setSymbol(point.attributes.HARD_CODE);
            point.attributes.HARD_CODE = changeContent(point.attributes.HARD_CODE);
            point.attributes.CRIME_CODE = descstat(point.attributes.CRIME_CODE);
            point.popupTemplate = popupTemplate;
            return point;
          });
          resultsLayer.addMany(peakResults);
          view.goTo(peakResults).then(function() {
            view.popup.open({
              features: peakResults,
              featureMenuOpen: true,
              updateLocationEnabled: false
            });
          });
          printResults.innerHTML = "Найдено результатов: " + peakResults.length;
          printResults.style.display = "block";
          onClickLoader.style.display = 'none';
          map.add(resultsLayer);
        };
      };

      popupTemplate = {
        title: "{CRIME_CODE}",
        content: [{
          type: 'fields',
          fieldInfos: [{
            fieldName: "UD",
            label: "Номер регистрации в ЕРДР",
            format: {
              places: 0,
              digitSeperator: true
            }
          },
          {
            fieldName: "STAT",
            label: "Статья УК РК",
            format: {
              places: 0,
              digitSeperator: true
            }
          },
          {
            fieldName: "HARD_CODE",
            label: "Категория преступления",
            format: {
              places: 0,
              digitSeperator: true
            }
          },
          {
            fieldName: "ORGAN",
            label: "Орган регистрации",
            format: {
              places: 0,
              digitSeperator: true
            }
          }, {
            fieldName: "DAT_SOVER_STR",
            label: "Дата совершения",
            format: {
              places: 0,
              digitSeperator: true
            }
          }, {
            fieldName: "FZ1R18P5",
            label: "Улица",
            format: {
              places: 0,
              digitSeperator: true
            }
          }, {
            fieldName: "FZ1R18P6",
            label: "Дом",
            format: {
              places: 0,
              digitSeperator: true
            }
          }]
        }]
      };

      // При нажатии на карту
      view.on("click", executeIdentifyTask);

      // create identify tasks and setup parameters
      identifyTask = new IdentifyTask(akkolUrl);

      params = new IdentifyParameters();
      params.tolerance = 4;
      params.returnGeometry = true;
      params.layerIds = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
      params.layerOption = "visible";
      params.width = view.width;
      params.height = view.height;

      function executeIdentifyTask(event) {
        // Set the geometry to the location of the view click
        params.geometry = event.mapPoint;
        params.mapExtent = view.extent;
        document.getElementById("viewDiv").style.cursor = "wait";

        // This function returns a promise that resolves to an array of features
        // A custom popupTemplate is set for each feature based on the layer it
        // originates from
        identifyTask.execute(params).then(function(response) {

          var results = response.results;

          return results.map(function(result) {

            var feature = result.feature;
            var layerName = result.layerName;

            feature.attributes.layerName = layerName;

            switch (layerName) {
              case 'Памятники':
                feature.popupTemplate = {
                  title: "Памятник",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Наменование_RU",
                      label: "Название памятника:",
                      visible: true,
                    },{
                      fieldName: "Фото",
                      label: "Фото:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Парк':
                feature.popupTemplate = {
                  title: "Парк",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Наименование_RU",
                      label: "Название парка:",
                      visible: true,
                    },{
                      fieldName: "shape_Length",
                      label: "Площадь парка:",
                      visible: true,
                    },{
                      fieldName: "shape_Area",
                      label: "Площадь парка:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Дорожные знаки':
                feature.popupTemplate = {
                  title: "Дорожный знак",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Наименование",
                      label: "Название знака:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Светофоры':
                feature.popupTemplate = {
                  title: "Светофор"
                };
                break;
              case 'опоры_ЛЭП':
                feature.popupTemplate = {
                  title: "Опора ЛЭП"
                };
                break;
              case 'Столбы_освещения':
                feature.popupTemplate = {
                  title: "Столб освещения"
                };
                break;
              case 'Колодцы':
                feature.popupTemplate = {
                  title: "Колодец",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Наименование",
                      label: "Название колодца:",
                      visible: true,
                    },{
                      fieldName: "Код",
                      label: "Тип колодца:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Остановочные_пункты':
                feature.popupTemplate = {
                  title: "Остановочный пункт",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Наименование_RU",
                      label: "Название остановки:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Парковка':
                feature.popupTemplate = {
                  title: "Парковка"
                };
                break;
              case 'Пешеходный переход':
                feature.popupTemplate = {
                  title: "Пешеходный переход",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Наименование_RU",
                      label: "Название пешехода:",
                      visible: true,
                    },{
                      fieldName: "shape_Length",
                      label: "Длина пешехода:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Водопровод':
                feature.popupTemplate = {
                  title: "Водопровод",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "shape_Length",
                      label: "Длина:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Бордюры':
                feature.popupTemplate = {
                  title: "Бордюры",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "shape_Length",
                      label: "Длина:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Автомобильная дорога':
                feature.popupTemplate = {
                  title: "Автомобильная дорога",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Тип",
                      label: "Тип:",
                      visible: true,
                    },{
                      fieldName: "shape_Length",
                      label: "Длина:",
                      visible: true,
                    },{
                      fieldName: "shape_Area",
                      label: "Площадь:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Улицы':
                feature.popupTemplate = {
                  title: "Улица",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Наименование_RU",
                      label: "Название улицы:",
                      visible: true,
                    },{
                      fieldName: "Старое название",
                      label: "Старое название:",
                      visible: true,
                    },{
                      fieldName: "Назначение",
                      label: "Назначение:",
                      visible: true,
                    },{
                      fieldName: "Тип покрытия",
                      label: "Тип:",
                      visible: true,
                    },{
                      fieldName: "shape_Length",
                      label: "Длина:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Котельная, насосные станции':
                feature.popupTemplate = {
                  title: "Котельная, насосные станции",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Наименование",
                      label: "Название станции:",
                      visible: true,
                    },{
                      fieldName: "Полное название",
                      label: "Полное название:",
                      visible: true,
                    },{
                      fieldName: "Тип",
                      label: "Тип:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'ЖД_станции':
                feature.popupTemplate = {
                  title: "ЖД станция",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Наименование_RU",
                      label: "Название станции:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Жд_пути':
                feature.popupTemplate = {
                  title: "Жд пути",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Состояние рельса",
                      label: "Состояние рельса:",
                      visible: true,
                    },{
                      fieldName: "shape_Length",
                      label: "shape_Length:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'ЛЭП':
                feature.popupTemplate = {
                  title: "ЛЭП",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Напряжение",
                      label: "Напряжение:",
                      visible: true,
                    },{
                      fieldName: "shape_Length",
                      label: "Длина:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Сооружения':
                feature.popupTemplate = {
                  title: "Здание",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Адрес_RU",
                      label: "Полный адрес:",
                      visible: true,
                    },{
                      fieldName: "Тип",
                      label: "Тип:",
                      visible: true,
                    },{
                      fieldName: "Название_RU",
                      label: "Название здания:",
                      visible: true,
                    },{
                      fieldName: "Этаж",
                      label: "Этаж:",
                      visible: true,
                    },{
                      fieldName: "Улица_RU",
                      label: "Улица:",
                      visible: true,
                    },{
                      fieldName: "Номер дома",
                      label: "Номер:",
                      visible: true,
                    },{
                      fieldName: "shape_Length",
                      label: "Длина:",
                      visible: true,
                    },{
                      fieldName: "shape_Area",
                      label: "Площадь:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Кварталы':
                feature.popupTemplate = {
                  title: "Квартал",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Наименование_RU",
                      label: "Название квартала:",
                      visible: true,
                    },{
                      fieldName: "shape_Length",
                      label: "Длина:",
                      visible: true,
                    },{
                      fieldName: "shape_Area",
                      label: "Площадь:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Озеро':
                feature.popupTemplate = {
                  title: "Озеро",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "Наименование_RU",
                      label: "Название квартала:",
                      visible: true,
                    },{
                      fieldName: "Тип",
                      label: "Тип:",
                      visible: true,
                    },{
                      fieldName: "shape_Length",
                      label: "Длина:",
                      visible: true,
                    },{
                      fieldName: "shape_Area",
                      label: "Площадь:",
                      visible: true,
                    }]
                  }]
                };
                break;
              case 'Реки':
                feature.popupTemplate = {
                  title: "Реки",
                  content: [{
                    type: "fields",
                    fieldInfos:[{
                      fieldName: "shape_Length",
                      label: "Длина:",
                      visible: true,
                    }]
                  }]
                };
                break;
            }

            return feature;
          });
        }).then(showPopup); // Send the array of features to showPopup()

        // Shows the results of the Identify in a popup once the promise is resolved
        function showPopup(response) {
          if (response.length > 0) {
            view.popup.open({
              features: response,
              location: event.mapPoint
            });
          }
          document.getElementById("viewDiv").style.cursor = "auto";
        }
      }

    });
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
     m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
     (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    ym(52996240, "init", {
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true,
      webvisor:true
    });
});
