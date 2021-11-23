import React from 'react';
import { ReactSVG } from 'react-svg';
import backArrow from '../assets/backArrow.svg';
import compartir from '../assets/compartir.svg';
import MostrarProdVigPorCat from './mostrarProdVigPorCat';
import urlServer from '../server';
//import LazyLoad from "react-lazyload";

const tiendaUrl = 'https://paradaonline.com.ar/s/img/tapas'
const imagenDefault = 'IC_CC.png'
export default class ShowBanner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            categoriaSeleccionada: this.props.categoriaSeleccionada,
            showBanner: true,
            mostrarTituloInput: this.props.mostrarTituloInput,
            descripcionesNov: []

        }
    }

    checkBrowser = () => {
        var sBrowser, sUsrAg = navigator.userAgent;

        // The order matters here, and this may report false positives for unlisted browsers.

        if (sUsrAg.indexOf("Firefox") > -1) {
            sBrowser = "Mozilla Firefox";
            // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
        } else if (sUsrAg.indexOf("SamsungBrowser") > -1) {
            sBrowser = "Samsung Internet";
            // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36
        } else if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) {
            sBrowser = "Opera";
            // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
        } else if (sUsrAg.indexOf("Trident") > -1) {
            sBrowser = "Microsoft Internet Explorer";
            // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
        } else if (sUsrAg.indexOf("Edge") > -1) {
            sBrowser = "Microsoft Edge (Legacy)";
            // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
        } else if (sUsrAg.indexOf("Edg") > -1) {
            sBrowser = "Microsoft Edge (Chromium)";
            // Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.64
        } else if (sUsrAg.indexOf("Chrome") > -1) {
            sBrowser = "Google Chrome or Chromium";
            // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
        } else if (sUsrAg.indexOf("Safari") > -1) {
            sBrowser = "Apple Safari";
            // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
        } else {
            sBrowser = "unknown";
        }

        return sBrowser
    }

    compartir = async (novedad) => {
        var agent = this.checkBrowser();
        var safariAgent = agent === 'Apple Safari' ? true : false
        alert(agent);
        fetch(`${tiendaUrl}/${novedad.imagenNombre}.png`)
         .then(function(response) {
               if(response.ok) {
                   response.blob()
                       .then(blobData => {
                           var file = new File([blobData], "picture.png", {type: 'image/png'});
                           var filesArray = [file];
                           if (safariAgent) {
                                if(navigator.canShare && navigator.canShare({ files: filesArray })) {
                                    navigator.share({
                                        files: filesArray
                                    })
                                    .then(() => console.log('Successful share'))
                                    .catch(error => console.log('Error sharing:', error));;
                                }
                            } else {
                                if(navigator.canShare && navigator.canShare({ files: filesArray })) {
                                    navigator.share({
                                        files: filesArray,
                                        title: 'Novedad',
                                        text: novedad.descripcionNovedad
                                    })
                                    .then(() => console.log('Successful share'))
                                    .catch(error => console.log('Error sharing:', error));;
                                }
                            }
                        });
               }
           })
           .catch(function(response) {
               fetch(`${tiendaUrl}/${imagenDefault}`)
                   .then(response => response.blob()) 
                   .then(blobData => {
                       var file = new File([blobData], "picture.png", {type: 'image/png'});
                       var filesArray = [file];
                       if (safariAgent) {
                            if(navigator.canShare && navigator.canShare({ files: filesArray })) {
                                navigator.share({
                                    files: filesArray
                                })
                                .then(() => console.log('Successful share'))
                                .catch(error => console.log('Error sharing:', error));;
                            }
                        } else {
                            if(navigator.canShare && navigator.canShare({ files: filesArray })) {
                                navigator.share({
                                    files: filesArray,
                                    title: 'Novedad',
                                    text: novedad.descripcionNovedad
                                })
                                .then(() => console.log('Successful share'))
                                .catch(error => console.log('Error sharing:', error));;
                            }
                        }
                   })
               })
       }

    componentDidMount() {
    }

    listadoNovedades = async () => {
        const headers = {
            "Content-Type": 'application/json',
            "Accept": 'application/json',
            Authorization: 'Bearer ' + localStorage.token
        }

        const data = {
            NombreTienda: "TIENDA AGEA"
        }

        const url = urlServer + "/api/novedades/novedadesVigentes/listar"

        const respuesta = await fetch(url,{
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers: headers
        })
        .then(response => response.json())
        .then(result => {
            this.setState({ descripcionesNov: result.rows })
        })
        .catch(error => { console.log('error', error) })

        return respuesta
    }

    addDefaultBannerSrc(ev){
        ev.target.src = `${tiendaUrl}/${imagenDefault}`
    }
   
    renderBannerConShareButton = () => {
        return (
            <div style={{paddingBottom: '90px'}}>
                <div id="backarrow" className="position-fixed back-arrow-box" onClick={() => {
                    this.setState({categoriaSeleccionada: this.props.categoriaSeleccionada, showBanner: false, mostrarTituloInput: false})
                    !this.props.VieneProdVigCat ? this.props.setStateVieneDelBanner() : console.log('')
                }}>
                    <ReactSVG src={backArrow} />
                </div>
                <div style= {{ display:'flex', justifyContent:'center'}}>  
                    <div className='banner-sharebutton-container'>
                        <div className='image-banner-container'>
                        {this.props.novedadSeleccionada.imagenNombre.match("PROMOCION")  ?
                            <a href= {tiendaUrl + "/"+this.props.novedadSeleccionada.imagenNombre+".pdf"} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={tiendaUrl + "/"+this.props.novedadSeleccionada.imagenNombre+".png"}
                                    alt={this.props.novedadSeleccionada.descripcionNovedad}
                                    onError={ this.addDefaultBannerSrc}
                                />
                            </a>
                        :
                            <img
                                src={tiendaUrl + "/"+this.props.novedadSeleccionada.imagenNombre+".png"}
                                alt={this.props.novedadSeleccionada.descripcionNovedad}
                                onError={ this.addDefaultBannerSrc}
                            />
                        }
                        </div>
                        
                        <div className="pt-2 share-button-container">
                            <ReactSVG src={compartir} style={{ cursor: 'pointer'}} onClick={() => this.compartir(this.props.novedadSeleccionada)}/>
                        </div>
                    </div>
                </div> 
            </div>
        )
    }

    render() {
        const { categoriaSeleccionada, showBanner, mostrarTituloInput} = this.state
        return(
        <div>
            {/* Flecha volver a categorias */}
            {this.state.showBanner ? 
                this.renderBannerConShareButton()
                :
                (this.props.desdeNovedad && !this.props.vieneDeNovFiltradaCat) ?
                //ejecuto la funcion del padre que hace que se renderize edicionNovedades mediante la modificacion de sus estados
                this.props.setEdicionNovedadesStates(this.props.desdeNovedad)
                : 
                (this.props.vieneDeNovFiltradaCat && !this.props.desdeNovedad) ?
                this.props.setStateVieneDeNovFiltradaCat()
                :
                <MostrarProdVigPorCat categoria= {categoriaSeleccionada} showBanner= {showBanner} mostrarTituloInput={mostrarTituloInput} setEdicionNovedadesStates={this.props.setEdicionNovedadesStates} />
            }
            
        </div>
        )
    }
}