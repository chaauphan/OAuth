const { exec } = require('child_process');

console.log('🔄 Restarting database connection...');

// Kill any existing Node processes
exec('taskkill /f /im node.exe', (error) => {
  if (error) {
    console.log('No Node processes to kill');
  } else {
    console.log('✅ Killed existing Node processes');
  }
  
  // Wait a moment then restart
  setTimeout(() => {
    console.log('🚀 Starting development server...');
    exec('npm run dev', (error, stdout, stderr) => {
      if (error) {
        console.error('Error starting server:', error);
        return;
      }
      console.log('✅ Development server started');
    });
  }, 2000);
}); 