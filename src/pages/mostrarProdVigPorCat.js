import React from 'react'
import { Title } from "../components/title";
import urlServer from '../server';
import ShowBanner from './showBanner';
import { ReactSVG } from 'react-svg';
import backArrow from '../assets/backArrow.svg'
import eyeSolid from '../assets/eyeSolid.svg'
import Spinner from '../components/spinner';



export default class MostrarProdVigPorCat extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            novPorCat: [],
            loading: false,
            MPVcat: false,
            showBanner: false,
            novedadSeleccionada:{},
            categoriaSeleccionada: this.props.categoria,
            flagNovProd: false,
            mostrarTituloInput: false,
            notificacionCount: 0,
            busqueda: '',
            busquedaPorCategoria: ''
        }
    }

    
    getNovedadPorCategoria = async () => {

        this.setState({loading: true})
        const headers = {
            "Content-Type": 'application/json',
            "Accept": 'application/json',
            Authorization: 'Bearer ' + localStorage.token
        }

        const data = {
            publicacionCategoriaId: this.props.categoria.publicacionCategoriaId
        }

        const url = urlServer + "/api/novedades/novedadesPorCategoria/listar"

        const respuesta = await fetch(url,{
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers: headers
        })
        .then(response => response.json())
        .then(result => {
            this.setState({ novPorCat: result.rows, notificacionCount: result.rows.length, loading: false })
        })
        .catch(error => {
            console.log('error', error)
        })

        return respuesta
    }

    renderNovedadesPorCategoria = () => {
        
        const { novPorCat } = this.state

        return(
            <div style={{paddingBottom: '130px'}}>
                <div id="backarrow" className="position-fixed back-arrow-box " onClick={() => {
                        this.setState({categoriaSeleccionada: null, mostrarTituloInput: true, flagNovProd: false})
                    }}>
                    <ReactSVG src={backArrow} />
                </div>
               
                <div className='container'>
                    <Title title= {`Productos Vigentes - ${this.props.categoria.descripcion}`}
                           classes='productos-vigentes-por-categoria' />

                    <div className="w-100 pb-3">
                        <input className="w-100 form-control" type="text" placeholder="Buscar" onChange={(e) => { 
                            this.setState({ busquedaPorCategoria: e.target.value });
                            this.setState({ busqueda: e.target.value });
                        }}

                        value={this.state.busqueda}/>
                    </div>
                </div>

                <div id='novedadesDescList' className='text-left container'>
                    {novPorCat.filter(a => JSON.stringify(Object.values(a))
                                        .toLowerCase()
                                        .indexOf(this.state.busqueda.toLowerCase()) !== -1)
                                        .map((currentValue,index) => {
                                            return(
                                                <div key={index} className="d-flex justify-content-between align-items-center days itemNovedadVigente mb-4">
                                                    <div className="f-13-5" style={{color: '#343435', maxWidth: '90%'}}>
                                                        <span className="span-item-nov">{ currentValue.descripcionNovedad }</span>
                                                        <div className="div-item-nov">Categoria: { this.props.categoria.descripcion }</div>
                                                    </div>
                                                    <div>
                                                        <ReactSVG style={{cursor: 'pointer', margin: '3px', width: '23px', height: '23px', color: '#224372', background: '#C7E6F9', borderRadius: '50%'}} src={eyeSolid} onClick={ () => {
                                                                                                                                        this.setState({showBanner: true, novedadSeleccionada:currentValue })                                                                            
                                                                                                                                        }} />
                                                    </div>
                                                </div> 
                                            )
                    }) }
                </div>
            </div>
        )
    }

    componentDidMount() {
        this.getNovedadPorCategoria()
    }

    render() {
        const { categoriaSeleccionada, loading } = this.state
        return (
            <React.Fragment>
                
                { loading ?
                    <Spinner/>
                     :
                    (this.state.showBanner ? 
                        <ShowBanner categoriaSeleccionada= {this.props.categoria} showBanner= {this.state.showBanner} novedadSeleccionada={this.state.novedadSeleccionada} setEdicionNovedadesStates={this.props.setEdicionNovedadesStates} desdeNovedad={false} VieneProdVigCat={true} /> 
                        :
                        categoriaSeleccionada == null 
                        ?
                        this.props.setEdicionNovedadesStates()
                        :
                        this.renderNovedadesPorCategoria())
                        }
            </React.Fragment>
            )
    }
      
}