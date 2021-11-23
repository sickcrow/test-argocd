import React from 'react';
import L from 'leaflet';
import * as ELG from 'esri-leaflet-geocoder';
import { Map, Marker, TileLayer } from 'react-leaflet';
import { ReactSVG } from 'react-svg';
import gps from '../assets/gps.svg'

// import marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png"
});

export default class Map2 extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            lat: parseFloat(this.props.x) || -35,
            lng: parseFloat(this.props.y) || -65,
            zoom: 16,
            loaded: false,
            modGPS: this.props.modGPS,
            markers: []
        }
    }

    changeMarker = (newLat, newLng) =>  {
        this.setState({
            lat: newLat,
            lng: newLng,
        })
    }
    
    getAddress = async (lat, lng) => {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        const response = await fetch(url)
        const data = await response.json()
        this.props.obtenerUbicacion(data.address)
    }

    sintildes = (string) => {
        if (typeof(string) === "string") {
            return string.toLowerCase().replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u')
        } else {
            return null
        }
    }

    catchData = async (data) => {
        const { setGPS } = this.props
        for (let i = data.results.length - 1; i >= 0; i--) {
            const result = data.results[i].properties
            const datos = {
                road: result.StPreType + result.StName,
                house_number: this.sintildes(result.AddNum),
                city: this.sintildes(result.Region),
                state_district: this.sintildes(result.Subregion),
                municipality: this.sintildes(result.City) || this.sintildes(result.Nbrhd)
            }

            if(await setGPS([result.Y, result.X])){
                await this.props.obtenerUbicacion(datos)
                this.props.validarDireccion()
                this.changeMarker(result.Y, result.X)
            }
        }
    }

    componentDidMount() {
        const map = this.leafletMap.leafletElement;
        this.searchControl = new ELG.Geosearch({useMapBounds: false, placeholder: 'Ingrese una dirección'}).addTo(map);
       // const results = new L.LayerGroup().addTo(map);
        this.searchControl.on('results', this.catchData);
    }
    
    render() {
        const lat = parseFloat(this.props.x || -35)
        const lng = parseFloat(this.props.y || -65)
        const { zoom } = this.state
        const { setGPS } = this.props
        const { changeMarker, getAddress } = this
        if(this.props.modGPS && this.searchControl) {
            this.searchControl._container.style = ""
        } else {
            if (this.searchControl) {
                this.searchControl._container.style = "display:none;"
            }
        }
        return  (<Map
                    onClick={e => {
                        setGPS([e.latlng.lat, e.latlng.lng])
                    }}
                    center={[lat, lng]}
                    onViewportChanged={e => {this.setState({zoom: (e.zoom)})}}
                    ref={m => {
                    this.leafletMap = m;
                    }}
                    zoom={zoom}>
                    <TileLayer  
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                    />
                    <Marker 
                        key={1}
                        position={[lat, lng]} 
                        draggable={this.props.modGPS? true : false}
                        ondragend={(e) => {
                            this.props.setGPS([e.target._latlng.lat, e.target._latlng.lng])
                           // console.log(e.target._latlng.lat, e.target._latlng.lng)
                        }}
                    />
                    {this.props.modGPS? 
                        <div onClick={() => {
                            if ("geolocation" in navigator) {
                                navigator.geolocation.getCurrentPosition(function(position) {
                                    let newLat = position.coords.latitude
                                    let newLng = position.coords.longitude
                                    if(setGPS([newLat, newLng])) {
                                        changeMarker(newLat, newLng)
                                        getAddress(position.coords.latitude, position.coords.longitude)
                                    };
                                }, (err) => {
                                    console.log(err)
                                    alert(err.message)});
                            } else {
                            console.log("geolocation not Available");
                            alert("not available")
                            }
                        }} className="btn btn-enviar gps-mapa d-flex justify-content-center">
                            <ReactSVG src={gps} style={{width: "8px", height: "auto", marginTop: '-2px', marginRight: '5px'}} />
                            Ubic. actual
                        </div>
                    : null}
                </Map>)
    }
}