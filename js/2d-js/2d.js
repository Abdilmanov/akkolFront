require([
  "esri/views/MapView",
  "esri/Map",
  "esri/layers/TileLayer",
  "esri/widgets/Expand",
  "esri/widgets/Home",
  "esri/widgets/Locate",
  "esri/widgets/BasemapGallery",
  "esri/layers/MapImageLayer",
  "esri/layers/ImageryLayer",
  "esri/widgets/LayerList",
  "esri/widgets/DistanceMeasurement2D",
  "esri/widgets/AreaMeasurement2D",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Sketch",
  "esri/widgets/Fullscreen",
  "esri/widgets/Print",
  "esri/tasks/IdentifyTask",
  "esri/tasks/support/IdentifyParameters",
  "esri/widgets/Search",
  "esri/widgets/Directions",
  "esri/core/urlUtils",
  "esri/geometry/Point",
  "esri/core/watchUtils"
  // "esri/tasks/RouteTask",
  // "esri/tasks/support/RouteParameters",
  // "esri/tasks/support/FeatureSet",
  // "esri/Graphic"
  ], function (
    MapView, Map, TileLayer, Expand, Home, Locate, BasemapGallery, MapImageLayer,
    ImageryLayer, LayerList, DistanceMeasurement2D, AreaMeasurement2D, GraphicsLayer,
    Sketch, Fullscreen, Print, IdentifyTask, IdentifyParameters, Search,
    Directions, urlUtils, Point, watchUtils
    // RouteTask, RouteParameters, FeatureSet, Graphic
  ) {
    var adressUrl, aeroAkkolUrl, akkolUrl, tileLayer, tileLayer2, map, sketchLayer,
    view, print, sketch, basemapGallery, locateBtn, homeWidget, layerList, layerListExpand,
    fullscreen, measureExpand, identifyTask, searchWidget;
    // routeUrl, routeTask, routeLayer, routeParams, stopSymbol, routeSymbol;
    var activeWidget = null;
    akkolUrl = "http://gisapp1.3dmap.kz/server/rest/services/AkkolDidar/AkkolLayers/MapServer";
    aeroAkkolUrl = "https://gisapp1.3dmap.kz/server/rest/services/Map/AkkolRas/ImageServer";
    adressUrl = "https://gisapp1.3dmap.kz/server/rest/services/AkkolDidar/Adress/FeatureServer/0";
    // routeUrl = "https://utility.arcgis.com/usrsvcs/appservices/srsKxBIxJZB0pTZ0/rest/services/World/Route/NAServer/Route_World";

    // Прокси
    urlUtils.addProxyRule({
      urlPrefix: "route.arcgis.com",
      proxyUrl: "https://95.59.124.162:9443/Myproxy/proxy.ashx"
    });

    // // Url Маршрут
    // routeTask = new RouteTask({
    //   url: routeUrl
    // });

    // Url Векторный слой г.Акколь
    tileLayer = new MapImageLayer({
      url: akkolUrl,
      title: "Векторный слой г.Акколь"
    });

    // Url Аэро-фото снимок г.Акколь
    tileLayer2 = new ImageryLayer({
      url: aeroAkkolUrl,
      title: "Аэро-фото снимок г.Акколь"
    });

    // Слой Эскиз
    sketchLayer = new GraphicsLayer({
      title: "Эскиз",
      listMode: "hide"
    });

    // // Слои Маршрут
    // routeLayer = new GraphicsLayer();
    //
    // // Параметры Маршрута
    // routeParams = new RouteParameters({
    //   stops: new FeatureSet(),
    //   outSpatialReference: {
    //     wkid: 3857
    //   }
    // });
    //
    // // Символ Остановки
    // stopSymbol = {
    //   type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
    //   style: "cross",
    //   size: 15,
    //   outline: {
    //     // autocasts as new SimpleLineSymbol()
    //     width: 4
    //   }
    // };
    //
    // // Символ Пути маршрута
    // routeSymbol = {
    //   type: "simple-line", // autocasts as SimpleLineSymbol()
    //   color: [0, 0, 255, 0.5],
    //   width: 5
    // };

    // Карта
    map = new Map({
      basemap: 'hybrid',
      layers: [tileLayer2, tileLayer, sketchLayer]
    });

    // Создание 2d Карты
    view = new MapView({
      container: "viewDiv",
      map: map,
      zoom: 14,
      center: [70.952948, 51.995855]
    });

    // Обзорная карта
    var overviewMap = new Map({
      basemap: "topo"
    });

    // Создание карты для Обзорной карты
    var mapView = new MapView({
      container: "overviewDiv",
      map: overviewMap,
      constraints: {
        rotationEnabled: false
      }
    });

    // Кнопка для Печати
    print = new Expand({
      view: view,
      content: new Print({ // Печать
        view: view,
        printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
      }),
      expandTooltip: "Печать",
      expandIconClass: "esri-icon-printer"
    });

    // На полный экран
    fullscreen = new Fullscreen({
      view: view
    });

    // Кнопка для Эскиза
    sketch = new Expand({
      view: view,
      content: new Sketch({ // Эскиз
        layer: sketchLayer,
        view: view
      }),
      expandTooltip: "Инструменты для Эскиза",
      expandIconClass: "esri-icon-edit"
    });

    // Кнопка для Базовых карт
    basemapGallery = new Expand({
      view: view,
      content: new BasemapGallery({ //Базовые карты
        view: view,
        container: document.createElement("div")
      }),
      expandTooltip: "Базовые карты",
      expandIconClass: "esri-icon-basemap"
    });

    // Местоположение
    locateBtn = new Locate({
      view: view
    });

    // Вид карты по умолчанию
    homeWidget = new Home({
      view: view
    });

    // Слои
    layerList = new LayerList({
      view: view,
      container: document.createElement("div"),
      listItemCreatedFunction: function(event) {
        const item = event.item;
        if(item.layer.title == "Векторный слой г.Акколь"){
          item.panel = {
            content: "legend",
            open: false
          };
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
        } else if(item.layer.title == "Аэро-фото снимок г.Акколь"){
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

    // Кнопка для Слоев
    layerListExpand = new Expand({
      view: view,
      content: layerList.container,
      expandIconClass: "esri-icon-layers",
      expandTooltip: "Слои",
      expanded: true
    });


    var directions = new Expand({
      view: view,
      content: directionsWidget = new Directions({
        view: view
      }),
      expandIconClass: "esri-icon-north-navigation-filled",
      expandTooltip: "Маршрут"
    });

    // // Remove the default widgets
    // mapView.ui.components = [];
    //
    // var extentDiv = document.getElementById("extentDiv");

    view.when(function() {

      // Анимация загрузки офф
      document.getElementById("main_loading").style.display = "none";

      // Размещение
      view.ui.add(locateBtn, "top-left");
      view.ui.add(homeWidget, "top-left");

      view.ui.add(fullscreen, "top-right");
      view.ui.add(basemapGallery, "top-right");
      view.ui.add(sketch, "top-right");
      view.ui.add("topRight", "top-right");

      view.ui.add(print, "bottom-left");
      view.ui.add(directions, "bottom-left");

      view.ui.add(layerListExpand, "bottom-right");

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

          if (event.item.layer.opacity <= 1) {
            event.item.layer.opacity += 0.25;
          }
        } else if (id === "decrease-opacity") {

          // if the decrease-opacity action is triggered, then
          // decrease the opacity of the GroupLayer by 0.25

          if (event.item.layer.opacity >= 0.25) {
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

      // // Обзорная карта
      // mapView.when(function() {
      //   // Update the overview extent whenever the MapView or SceneView extent changes
      //   view.watch("extent", updateOverviewExtent);
      //   mapView.watch("extent", updateOverviewExtent);
      //
      //   // Update the minimap overview when the main view becomes stationary
      //   watchUtils.when(view, "stationary", updateOverview);
      //
      //   function updateOverview() {
      //     // Animate the MapView to a zoomed-out scale so we get a nice overview.
      //     // We use the "progress" callback of the goTo promise to update
      //     // the overview extent while animating
      //     mapView.goTo({
      //       center: view.center,
      //       scale:
      //         view.scale *
      //         2 *
      //         Math.max(
      //           view.width / mapView.width,
      //           view.height / mapView.height
      //         )
      //     });
      //   }
      //
      //   function updateOverviewExtent() {
      //     // Update the overview extent by converting the SceneView extent to the
      //     // MapView screen coordinates and updating the extentDiv position.
      //     var extent = view.extent;
      //
      //     var bottomLeft = mapView.toScreen(
      //       new Point({
      //         x: extent.xmin,
      //         y: extent.ymin,
      //         spatialReference: extent.spatialReference
      //       })
      //     );
      //
      //     var topRight = mapView.toScreen(
      //       new Point({
      //         x: extent.xmax,
      //         y: extent.ymax,
      //         spatialReference: extent.spatialReference
      //       })
      //     );
      //
      //     extentDiv.style.top = topRight.y + "px";
      //     extentDiv.style.left = bottomLeft.x + "px";
      //
      //     extentDiv.style.height = bottomLeft.y - topRight.y + "px";
      //     extentDiv.style.width = topRight.x - bottomLeft.x + "px";
      //   }
      // });

    });

    // Измерение
    var measure_button = document.getElementById("measure_button");
    var measure_panel = document.getElementById("measure_panel");
    var measure_panel_visible = false;
    measure_button.addEventListener("click",
      function () {
        if(!measure_panel_visible){
          measure_panel.classList.add("opacity");
          measure_panel_visible = true;
          measure_button.style.backgroundImage = "url('./img/back.png')";
        } else {
          measure_panel.classList.remove("opacity");
          measure_panel_visible = false;
          measure_button.style.backgroundImage = "url('./img/measure.png')";
        }
    });

    document.getElementById("distanceButton").addEventListener("click",
      function () {
        setActiveWidget(null);
        if (!this.classList.contains('active')) {
          setActiveWidget('distance');
        } else {
          setActiveButton(null);
        }
      });

    document.getElementById("areaButton").addEventListener("click",
      function () {
        setActiveWidget(null);
        if (!this.classList.contains('active')) {
          setActiveWidget('area');
        } else {
          setActiveButton(null);
        }
    });

    function setActiveWidget(type) {
      switch (type) {
        case "distance":
          activeWidget = new DistanceMeasurement2D({
            view: view
          });

          // skip the initial 'new measurement' button
          activeWidget.viewModel.newMeasurement();

          view.ui.add(activeWidget, "top-right");
          setActiveButton(document.getElementById('distanceButton'));
          break;
        case "area":
          activeWidget = new AreaMeasurement2D({
            view: view
          });

          // skip the initial 'new measurement' button
          activeWidget.viewModel.newMeasurement();

          view.ui.add(activeWidget, "top-right");
          setActiveButton(document.getElementById('areaButton'));
          break;
        case null:
          if (activeWidget) {
            view.ui.remove(activeWidget);
            activeWidget.destroy();
            activeWidget = null;
          }
          break;
      }
    }

    function setActiveButton(selectedButton) {
      // focus the view to activate keyboard shortcuts for sketching
      view.focus();
      var elements = document.getElementsByClassName("active");
      for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove("active");
      }
      if (selectedButton) {
        selectedButton.classList.add("active");
      }
    }

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

    // При нажатии на карту
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

    // function addStop(event) {
    //   // Add a point at the location of the map click
    //   var stop = new Graphic({
    //     geometry: event.mapPoint,
    //     symbol: stopSymbol
    //   });
    //   routeLayer.add(stop);
    //
    //   // Execute the route task if 2 or more stops are input
    //   routeParams.stops.features.push(stop);
    //   if (routeParams.stops.features.length >= 2) {
    //     routeTask.solve(routeParams).then(showRoute);
    //   }
    // }

    // Adds the solved route to the map as a graphic
    // function showRoute(data) {
    //   var routeResult = data.routeResults[0].route;
    //   routeResult.symbol = routeSymbol;
    //   routeLayer.add(routeResult);
    // }

    // Яндекс-Метрика
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
