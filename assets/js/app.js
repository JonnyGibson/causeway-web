const audioPoints = [
    {
        id: "intro",
        title: "Welcome to Giant's Causeway",
        description: "Introduction to your audio guide",
        audioFile: "./assets/audio/en/guideintro.mp3",
        position: { x: 85, y: 85 },
        isInfo: true
    },
    {
        id: "1",
        title: "The Bay of Cows",
        description: "Final resting place of Finn McCool's camel",
        audioFile: "./assets/audio/en/guide1.mp3",
        position: { x: 22, y: 65 }
    },
    {
        id: "2",
        title: "The Stookans & Windy Gap",
        description: "So named because they look like two stacks of hay",
        audioFile: "./assets/audio/en/guide2.mp3",
        position: { x: 35, y: 45 }
    },
    {
        id: "3",
        title: "The Little Causeway",
        description: "Home to the legendary Wishing Chair",
        audioFile: "./assets/audio/en/guide3.mp3",
        position: { x: 45, y: 55 }
    },
    {
        id: "4",
        title: "The Honeycomb",
        description: "The 40,000 interlocking, basalt columns that make up the Giant's Causeway",
        audioFile: "./assets/audio/en/guide4.mp3",
        position: { x: 55, y: 40 }
    },
    {
        id: "5",
        title: "Port Noffer",
        description: "The third bay of the causeway, and home to some of the most famous, giant artefacts",
        audioFile: "./assets/audio/en/guide5.mp3",
        position: { x: 65, y: 35 }
    },
    {
        id: "6",
        title: "The Girona Shipwreck",
        description: "La Girona was a galleass of the Spanish Armada that foundered and sank off Lacada Point",
        audioFile: "./assets/audio/en/guide6.mp3",
        position: { x: 25, y: 15 }
    }
];

function createAudioMarker(point) {
    const marker = document.createElement('button');
    marker.className = `audio-marker ${point.isInfo ? 'intro' : ''}`;
    marker.style.left = `${point.position.x}%`;
    marker.style.top = `${point.position.y}%`;
    
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.textContent = point.isInfo ? 'headphones' : 'play_circle';
    marker.appendChild(icon);
    
    marker.addEventListener('click', () => showAudioInfo(point));
    return marker;
}

function showAudioInfo(point) {
    // Remove active class from all markers
    document.querySelectorAll('.audio-marker').forEach(marker => {
        marker.classList.remove('active');
    });
    
    // Add active class to clicked marker
    event.currentTarget.classList.add('active');
    
    const infoPanel = document.getElementById('audioInfo');
    infoPanel.style.display = 'block';
    infoPanel.querySelector('h3').textContent = point.title;
    infoPanel.querySelector('p').textContent = point.description;
    const audio = infoPanel.querySelector('audio');
    audio.src = point.audioFile;
    audio.play();
}

// Initialize the map
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.querySelector('.map-container');
    audioPoints.forEach(point => {
        mapContainer.appendChild(createAudioMarker(point));
    });

    // Close button functionality
    document.querySelector('.close-button').addEventListener('click', () => {
        const infoPanel = document.getElementById('audioInfo');
        infoPanel.style.display = 'none';
        infoPanel.querySelector('audio').pause();
        // Remove active state from all markers
        document.querySelectorAll('.audio-marker').forEach(marker => {
            marker.classList.remove('active');
        });
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
        const infoPanel = document.getElementById('audioInfo');
        if (!e.target.closest('.audio-marker') && 
            !e.target.closest('.audio-info') && 
            infoPanel.style.display === 'block') {
            infoPanel.style.display = 'none';
            infoPanel.querySelector('audio').pause();
            // Remove active state from all markers when clicking outside
            document.querySelectorAll('.audio-marker').forEach(marker => {
                marker.classList.remove('active');
            });
        }
    });

    // Toolbar functionality
    const mapButton = document.getElementById('mapButton');
    const infoButton = document.getElementById('infoButton');
    const menuButton = document.getElementById('menuButton');
    
    const buttons = [mapButton, infoButton, menuButton];
    const popovers = document.querySelectorAll('.popover-content');
    const closeButtons = document.querySelectorAll('.close-button');

    // Function to close all popovers
    function closeAllPopovers() {
        popovers.forEach(popover => popover.style.display = 'none');
        buttons.forEach(button => button.classList.remove('active'));
        mapButton.classList.add('active'); // Map is default active state
    }

    // Handle button clicks
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.id === 'mapButton') {
                closeAllPopovers();  // Close any open popovers when map is clicked
                return;
            }
            
            const popoverId = this.id.replace('Button', 'Popover');
            const popover = document.getElementById(popoverId);
            
            if (popover) {
                // Close other popovers
                popovers.forEach(p => {
                    if (p !== popover) p.style.display = 'none';
                });
                
                // Toggle this popover
                const isShowing = popover.style.display === 'block';
                popover.style.display = isShowing ? 'none' : 'block';
                
                // Update active states
                buttons.forEach(b => b.classList.remove('active'));
                if (!isShowing) {
                    this.classList.add('active');
                } else {
                    mapButton.classList.add('active');
                }
            }
        });
    });

    // Handle close button clicks
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent button click from triggering
            closeAllPopovers();
        });
    });

    // Close popovers when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.hex-button')) {
            closeAllPopovers();
        }
    });
}); 