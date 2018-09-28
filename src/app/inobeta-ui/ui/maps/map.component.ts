import {Component, ViewEncapsulation, Input, OnInit} from '@angular/core';
import  * as ol  from 'openlayers';
@Component({
  selector: 'ib-map',
  template: `
<!--<aol-map [width]="width + 'px'" [height]="height+ 'px'">
	<aol-view [zoom]="zoom">
		<aol-coordinate [x]="5" [y]="45" [srid]="'EPSG:4326'"></aol-coordinate>
	</aol-view>
	<aol-layer-tile [opacity]="opacity">
    <aol-source-osm></aol-source-osm>
	</aol-layer-tile>

	<aol-layer-vector [opacity]="opacity">
		<aol-source-vector>
			<aol-feature *ngFor="let p of this.points">
				<aol-geometry-point>
					<aol-coordinate [x]="p.x" [y]="p.y" [srid]="'EPSG:4326'"></aol-coordinate>
				</aol-geometry-point>
				<aol-style>
	        <aol-style-icon
	          [src]="'assets/maps/marker.png'"
	          [anchor]="[0.5, 1]"
	          [anchorXUnits]="'fraction'" [anchorYUnits]="'fraction'"
	          [scale]="0.05"
	          [anchorOrigin]="'top-left'">
	        </aol-style-icon>
	      </aol-style>
	    </aol-feature>
		</aol-source-vector>
	</aol-layer-vector>


	<aol-interaction-default></aol-interaction-default>
	<aol-control-defaults></aol-control-defaults>
</aol-map>-->
    <link rel="stylesheet" href="https://openlayers.org/en/v4.4.2/css/ol.css" type="text/css">
 <style>

    #info {
      position: absolute;
      height: 1px;
      width: 1px;
      z-index: 100;
    }
    .tooltip.in {
      opacity: 1;
    }
    .tooltip.top .tooltip-arrow {
      border-top-color: white;
    }
    .tooltip-inner {
      border: 2px solid white;
    }
  </style>
<div id="map" class="map"  ></div>
`
})


export class MapComponent implements OnInit {
  map;


  ngOnInit(): void {

    const _self = this;

    const textFill = new ol.style.Fill({
      color: '#fff'
    });
    const textStroke = new ol.style.Stroke({
      color: 'rgba(0, 0, 0, 0.6)',
      width: 3
    });
    const invisibleFill = new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.01)'
    });

    function createMarkerStyle(feature) {

      return new ol.style.Style({
        geometry: feature.getGeometry(),
        image: new ol.style.Icon({
          src: 'assets/maps/marker.png',
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          scale: 0.05,
          anchorOrigin: 'top-left'
        })
      });
    }

    let maxFeatureCount, vector;
    function calculateClusterInfo(resolution) {
      maxFeatureCount = 0;
      const features = vector.getSource().getFeatures();
      let feature, radius;
      for (let i = features.length - 1; i >= 0; --i) {
        feature = features[i];
        const originalFeatures = feature.get('features');
        const extent = ol.extent.createEmpty();
        let j, jj;
        for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
          ol.extent.extend(extent, originalFeatures[j].getGeometry().getExtent());
        }
        maxFeatureCount = Math.max(maxFeatureCount, jj);
        radius = 0.5 * (ol.extent.getWidth(extent) + ol.extent.getHeight(extent)) /
          resolution;
        feature.set('radius', radius);
      }
    }

    let currentResolution;
    function styleFunction(feature, resolution) {
      if (resolution != currentResolution) {
        calculateClusterInfo(resolution);
        currentResolution = resolution;
      }
      let style;
      const size = feature.get('features').length;
      if (size > 1) {
        style = new ol.style.Style({
          image: new ol.style.Circle({
            radius: feature.get('radius'),
            fill: new ol.style.Fill({
              color: '#008cff' //[255, 153, 0, Math.min(0.8, 0.4 + (size / maxFeatureCount))]
            })
          }),
          text: new ol.style.Text({
            text: size.toString(),
            fill: textFill,
            stroke: textStroke
          })
        });
      } else {
        const originalFeature = feature.get('features')[0];
        style = createMarkerStyle(originalFeature);
      }

      return style;
    }

    function selectStyleFunction(feature) {
      const styles = [new ol.style.Style({
        image: new ol.style.Circle({
          radius: feature.get('radius'),
          fill: invisibleFill
        })
      })];
      const originalFeatures = feature.get('features');
      let originalFeature;
      for (let i = originalFeatures.length - 1; i >= 0; --i) {
        originalFeature = originalFeatures[i];
        styles.push(createMarkerStyle(originalFeature));
      }
      return styles;
    }

    const features = [];
    this.points.forEach((p) => {
      const point = new ol.geom.Point([p.x, p.y]);
      point.transform('EPSG:4326', 'EPSG:900913');
      const feat = new ol.Feature(point);
      feat.setId(p.id);
      feat.set('data', p.payload);
      console.log(feat.getId());
      features.push(feat);
    });

    vector = new ol.layer.Vector({
      source: new ol.source.Cluster({
        distance: 40,
        source: new ol.source.Vector({
          //url: 'https://openlayers.org/en/v4.4.2/examples/data/kml/2012_Earthquakes_Mag5.kml',
          features: features,
          format: new ol.format.KML({
            extractStyles: false
          })
        })
      }),
      style: styleFunction
    });

    const raster = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    _self.map = new ol.Map({
      layers: [raster, vector],
      interactions: ol.interaction.defaults().extend([new ol.interaction.Select({
        condition: function(evt) {
          return  evt.type == 'pointermove';
        },
        style: selectStyleFunction
      })]),
      target: 'map',
      view: new ol.View({
        center: [0, 0],
        zoom: 2
      })
    });

    this.map.setSize([this.width, this.height]);

    const featureClick = new ol.interaction.Select({
      condition: function(evt) {
        return  evt.type == 'singleclick';
      }
    });

    _self.map.addInteraction(featureClick);
    featureClick.on('select', function(e) {
      console.log(e.target.getFeatures().getLength() +
        ' selected features (last operation selected ' + e.selected.length +
        ' and deselected ' + e.deselected.length + ' features)', e.selected[0].getKeys());
    });


  }
  @Input() width: number;
  @Input() height: number;
  @Input() points: Point[];

  constructor() {}

  public zoom = 3;
  public opacity = 1.0;

} /* istanbul ignore next */


export class Point {
  x: number;
  y: number;
  id: any;
  payload: any;
}
