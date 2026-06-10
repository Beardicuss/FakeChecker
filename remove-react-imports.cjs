const fs = require('fs');

const files = [
    'src/components/CaseViewer.jsx',
    'src/components/CrtOverlay.jsx',
    'src/components/DecisionButtons.jsx',
    'src/components/DirectivePanel.jsx',
    'src/components/IncidentPanel.jsx',
    'src/components/MailIcon.jsx',
    'src/components/MailPage.jsx',
    'src/components/QuotaTracker.jsx',
    'src/components/SettingsMenu.jsx',
    'src/components/TimerDisplay.jsx',
    'src/components/TrustMeter.jsx',
    'src/components/minigames/IncidentOverlay.jsx',
    'src/screens/BootSequence.jsx',
    'src/screens/DemoEnd.jsx',
    'src/screens/IntroDirective.jsx',
    'src/screens/LoginScreen.jsx',
    'src/screens/NameEntry.jsx',
    'src/screens/ShiftReport.jsx',
    'src/screens/Upgrades.jsx',
    'src/screens/Workstation.jsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Remove `import React from 'react';`
    content = content.replace(/^import\s+React\s+from\s+['"]react['"];?\r?\n/m, '');
    // Remove React from `import React, { useState } from 'react';`
    content = content.replace(/^import\s+React,\s*\{/gm, 'import {');

    fs.writeFileSync(file, content);
});

console.log("Removed React imports from all files.");
