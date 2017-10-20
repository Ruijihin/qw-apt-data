var gulp = require("gulp");
var winInstaller = require('electron-winstaller');
gulp.task('create_windows_installer', function(done) {
  winInstaller.createWindowsInstaller({
    name: 'converter',
    authors: 'Lui',
    appDirectory: './app-builds/angular-electron-win32-ia32',
    iconUrl: 'file://' + __dirname + '/dist/favicon.ico'
  }).then(done).catch(done);
});