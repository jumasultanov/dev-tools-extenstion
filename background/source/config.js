/**
 * Файл конфигуации для приложения
 */

//Конфиг с данными по соединению с сервером
export let SERVICE_CONFIG = {
    HOST: 'dev-tools.local',
    API_ROOT: 'http://dev-tools.local/extension',
    API: method => SERVICE_CONFIG.API_ROOT+'/'+method
}