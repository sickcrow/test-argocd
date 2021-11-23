const { origin, hostname } = window.location

let server = {
    host: 'qaapi.kioscos.ddrcloud.com.ar'
}

const http = origin.indexOf('https') !== -1 ? 'https://' : 'http://'


switch (hostname) {
    case "pv.ddrcloud.com.ar":
        server.host = "api.kioscos.ddrcloud.com.ar"
        break;
    case "pp-kioscos.agea.com.ar":
        server.host = "preproapi.kioscos.ddrcloud.com.ar"
        break;
    default:
        break;
}

console.log(http + server.host)

var url = http + server.host