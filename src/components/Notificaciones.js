import * as React from 'react';
import TimeAgo from 'timeago-react'; 
import * as timeago from 'timeago.js';
import { ReactSVG } from 'react-svg'
import es from 'timeago.js/lib/lang/es';
import ReactGA from 'react-ga';

timeago.register('es', es);

const DateInitFormatter = ( value ) => {if(value) { return value.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/, '$3/$2/$1 $4:$5:$6').slice(0, -14)} else { return "" } };

export default class Notificaciones extends React.Component {

    componentDidMount() {
      document.title = "Notificaciones";

      ReactGA.event({
        category: 'Notificaciones',
        action: 'Mostrar Notificaciones'
      });
    }

    componentDidUpdate() {
        console.log(this.props)
    }

    render(){
        const { notificaciones } = this.props
        //MAQUETACIÓN DE NOTIFICACIONES(NO HAY API POR EL MOMENTO)
        return  <div id="notificaciones" >
                    {notificaciones? 
                    notificaciones.map((notif, index) => {
                        //POR CADA NOTIFICACIÓN CREA UN BLOQUE INDICANDO EL MENSAJE QUE RECIBE Y HACE CUÁNTO TIEMPO RECIBIÓ LA NOTIFICACIÓN
                        return  <div key={index} className={"d-flex align-items-center notif " + (notif.seen? "": "not-seen")}> 
                                    <div className="notif-icon position-relative">
                                        <ReactSVG className="icon position-absolute" src={this.props.assets[notif.category.toLowerCase()]} />
                                    </div>
                                    <div>
                                        <div>
                                            {notif.message}
                                        </div>
                                        <div className="f-10 itemcolor " >
                                        {(new Date()).getTime() - (new Date('2020-02-15')).getTime() < 604800000 ?
                                        <TimeAgo
                                            datetime={'2020-02-15 13:00:00'}
                                            locale='es'
                                        />:
                                        DateInitFormatter(new Date('2020-02-15').toISOString())
                                        }
                                        </div>
                                    </div>
                                </div>
                    })
                    : null}
                </div>
    }
}