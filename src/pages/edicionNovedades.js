import * as React from "react";
import { Title } from "../components/title";
import urlServer from '../server';
import { ReactSVG } from 'react-svg';
import eyeSolid from '../assets/eyeSolid.svg'
import MostrarProdVigPorCat from "./mostrarProdVigPorCat";
import ShowBanner from "./showBanner";

export default class EdicionNovedades extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            busqueda: '',
            busquedaPorCategoria: '',
            flagNovProd : true,
            categorias: [],
            descripcionesNov: [],
            categoriaId: 0,
            categoriaSeleccionada: null,
            mostrarTituloInput: true,
            novedadSeleccionada: {},
            showBanner: false,
            loadingList: false,
            loadedList: false,
            vieneDelBanner: false,
            descripcionesNovComun: {},
            vieneDeNovFiltradaCat: false
            };
    }
    
    marcarComoLeidaNovedad = async (novedad) => {
        const headers = {
            "Content-Type": 'application/json',
            "Accept": 'application/json',
            Authorization: 'Bearer ' + localStorage.token
        }

        const data = {
            publicacionCategoriaId: novedad.publicacionCategoriaId,
            novedadesVigentesId: novedad.novedadesVigentesId
        }

        const url = urlServer + "/api/novedades/novedadesBanner/leer"

        const respuesta = await fetch(url , {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers: headers
        }).then(response => response.json())
            .then(result => {})
            .catch(error => console.log('error', error))

        return respuesta
    }

    obtenerNombreCategoria = (novedad) => {
       let { categorias } = this.state;
       let nombreCategoria = '';
       let i = categorias.findIndex(element => element.publicacionCategoriaId === novedad.publicacionCategoriaId)
       nombreCategoria = i === -1? '' : categorias[i].descripcion
       
       return nombreCategoria
    }

    listadoCategorias = async () => {
        const headers = {
            "Content-Type": 'application/json',
            "Accept": 'application/json',
            Authorization: 'Bearer ' + localStorage.token
        }

        const data = {
            NombreTienda: "TIENDA AGEA"
        }

        const url = urlServer + "/api/novedades/novedadesCategoria/listarCategorias";

        const respuesta = await fetch(url, {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers: headers
        })
        .then(response => response.json())
        .then(result => {
            this.setState({categorias: result.rows});
        })
        .catch(error => {
            console.log('error', error)
        });
        
      return respuesta

    }

    setStateVieneDelBanner = () => {
        this.setState({vieneDelBanner: true})
    }

    listadoNovedadesComun = async () => {
        this.setState({loadingList: true, vieneDelBanner: false})
        const headers = {
            "Content-Type": 'application/json',
            "Accept": 'application/json',
            Authorization: 'Bearer ' + localStorage.token
        }

        const data = {
            NombreTienda: "TIENDA AGEA"
        }

        const url = urlServer + "/api/novedades/novedadesVigentes/listarComun"

        const respuesta = await fetch(url,{
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers: headers
        })
        .then(response => response.json())
        .then(result => {
            this.setState({ descripcionesNovComun: result.rows, loadedList: true })
        })
        .catch(error => { console.log('error', error) })

        return respuesta

    }

    listadoNovedades = async () => {
        this.setState({loadingList: true, vieneDelBanner: false})
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
            this.setState({ descripcionesNov: result.rows, loadedList: true })
        })
        .catch(error => { console.log('error', error) })

        return respuesta
    }

    filterNovedades = (element) => {
        let { descripcionNovedad } = element
        
        return JSON.stringify(descripcionNovedad).toLowerCase().indexOf(this.state.busqueda.toLowerCase())
    }

    renderCategorias = () => {
        const { categorias } = this.state
        return (
            <div className="w-100 container" style={{marginBottom:'-80px'}}>
                <div style={{
                    paddingBottom: '10px', // padding con seccion destacados
                    marginTop: '10px',
                    display: 'grid',
                    gridGap: '8px',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(98px, 1fr))',
                    justifyItems: 'center'
                    }}>
                    {categorias.filter(a => JSON.stringify(Object.values(a))
                                        .toLowerCase()
                                        .indexOf(this.state.busqueda.toLowerCase()) !== -1)
                                                .map((card, index) => {
                                                    return (
                                                                <div key={index} className="categoria d-flex justify-content-center align-items-center" onClick={ () => {
                                                                    this.setState({categoriaSeleccionada: card, mostrarTituloInput : false, showBanner: false})
                                                                    }}>
                                                                                                                
                                                                    <div className="d-flex justify-content-center align-items-center text-center" style={{color: 'white', fontWeight: '400'}}>
                                                                        {card.descripcion}
                                                                    </div>
                                                                </div>
                                                            )
                    })}
                </div>
            </div>
        )
    }

    setEdicionNovedadesStates = (desdeNovedad) => {
        desdeNovedad ? 
        this.setState({categoriaSeleccionada: null, mostrarTituloInput: true, flagNovProd: true}) :
        this.setState({categoriaSeleccionada: null, mostrarTituloInput: true, flagNovProd: false})
    }

    renderNovedades = () => {
        const { descripcionesNov } = this.state

        return (
            <div id='novedadesDescList' className='text-left container' style={{paddingBottom: '130px'}} >
                {this.state.descripcionesNov ?
                 descripcionesNov.filter(a => this.filterNovedades(a) !== -1)
                                        .map( (currentValue,index) => {
                                            return(
                                                    <div key={index} className="d-flex justify-content-between align-items-center days itemNovedadVigente mb-4">
                                                        <div className="f-13-5" style={{color: '#343435', maxWidth: '90%'}}>
                                                            <span className="span-item-nov">{ currentValue.descripcionNovedad }</span>
                                                            <div className="div-item-nov">Categoria: { this.obtenerNombreCategoria(currentValue) }</div>
                                                        </div>
                                                        <div>
                                                            <ReactSVG style={{cursor: 'pointer', margin: '3px', width: '23px', height: '23px', color: '#224372', background: '#C7E6F9', borderRadius: '50%'}} src={eyeSolid} onClick={ (e) => {
                                                                                                                                            this.marcarComoLeidaNovedad(currentValue)
                                                                                                                                            this.setState({showBanner: true, mostrarTituloInput: false, novedadSeleccionada: currentValue })
                                                                                                                                            }} />
                                                        </div>
                                                    </div>
                                                    )
                                        })
                
                : null
            }
            </div>
        )
    }

    renderNovedadesFiltradas = () => {
        const { descripcionesNovComun } = this.state

        return (
            <div id='novedadesDescList' className='text-left container' style={{paddingBottom: '130px'}}>
                { descripcionesNovComun.filter(a => this.filterNovedades(a) !== -1)
                                            .map( (currentValue,index) => {
                                                return(
                                                        <div key={index} className="d-flex justify-content-between align-items-center days itemNovedadVigente mb-4">
                                                            <div className="f-13-5" style={{color: '#343435', maxWidth: '90%'}}>
                                                                <span className="span-item-nov">{ currentValue.descripcionNovedad }</span>
                                                                <div className="div-item-nov">Categoria: { this.obtenerNombreCategoria(currentValue) }</div>
                                                            </div>
                                                            <div>
                                                                <ReactSVG style={{cursor: 'pointer', margin: '3px', width: '23px', height: '23px', color: '#224372', background: '#C7E6F9', borderRadius: '50%'}} src={eyeSolid} onClick={ (e) => {
                                                                                                                                                this.setState({showBanner: true, mostrarTituloInput: false, novedadSeleccionada: currentValue, vieneDeNovFiltradaCat: true })
                                                                                                                                                }} />
                                                            </div>
                                                        </div>
                                                        )
                                            })
                }
            </div>
        )
    }

   

    renderTitleInputPestañas = () => {
        return (
            <div className='container'>

                <Title title="Novedades/Productos Vigentes" />

                <div className="w-100">
                    <input className="w-100 form-control" type="text" placeholder="Buscar" onChange={(e) => { 
                        this.setState({ busquedaPorCategoria: e.target.value });
                        this.setState({ busqueda: e.target.value });
                    }}

                    value={this.state.busqueda}/>
                </div>

                <div className="tabs d-flex justify-content-between  " style={{borderBottom: '1px solid gray', marginBottom: '18px'}}>
                    <div className={"tablinks col-6 text-center" + (this.state.flagNovProd ? ' active' : '')} onClick={(e) => {
                        this.setState({flagNovProd: true})
                        }}>
                        Novedades
                    </div>
                    <div className={"tablinks col-6 text-center" + (!this.state.flagNovProd ? ' active' : '')} onClick={(e) => {
                        this.setState({flagNovProd: false})
                        }}>
                        Productos Vigentes
                    </div>
                </div>

            </div>
                
        )
    }

    componentDidUpdate() {
        const {loadedList, loadingList, vieneDelBanner} = this.state
        if ((!loadedList && !loadingList) || vieneDelBanner ) {
            this.listadoNovedades()
            this.listadoNovedadesComun()
        }
    }

    componentDidMount() {
        this.listadoNovedades()
        this.listadoNovedadesComun()
        this.listadoCategorias()
    }

    setStateVieneDeNovFiltradaCat = () => {
        this.setState({flagNovProd: false, categoriaSeleccionada: null, mostrarTituloInput: true})
    }

    render() {
        return (
            <div id='edicionNovedades' className="text-left" >
               
               
                { this.state.mostrarTituloInput ? this.renderTitleInputPestañas() : null  }
                {   
                    (this.state.categoriaSeleccionada === null && this.state.mostrarTituloInput) 
                    ? 
                    (this.state.flagNovProd ?  this.renderNovedades() : this.state.busqueda === '' ? this.renderCategorias() : this.renderNovedadesFiltradas()) 
                    : 
                    (this.state.showBanner && !this.state.vieneDeNovFiltradaCat) ?
                    <ShowBanner showBanner= {this.state.showBanner}  novedadSeleccionada={this.state.novedadSeleccionada}
                     desdeNovedad= {true} setEdicionNovedadesStates= {this.setEdicionNovedadesStates} setStateVieneDelBanner={this.setStateVieneDelBanner}
                     /> 
                    :
                    (this.state.showBanner && this.state.vieneDeNovFiltradaCat) ?
                    <ShowBanner showBanner= {this.state.showBanner} vieneDeNovFiltradaCat={this.state.vieneDeNovFiltradaCat} novedadSeleccionada={this.state.novedadSeleccionada}
                    setStateVieneDelBanner={this.setStateVieneDelBanner} setStateVieneDeNovFiltradaCat={this.setStateVieneDeNovFiltradaCat}/> 
                    :
                    <MostrarProdVigPorCat categoria={this.state.categoriaSeleccionada} setEdicionNovedadesStates= {this.setEdicionNovedadesStates} desdeNovedad={false} showBanner={true}/>
                }
            </div>
        );
    }
}