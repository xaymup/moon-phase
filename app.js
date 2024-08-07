document.addEventListener('DOMContentLoaded', () => {
    const datePicker = document.getElementById('date-picker');
    const moonPhaseResult = document.getElementById('moon-phase-result');
    const getMoonPhaseButton = document.getElementById('get-moon-phase');

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    datePicker.value = today;

    getMoonPhaseButton.addEventListener('click', () => {
        const selectedDate = datePicker.value;
        fetchMoonPhase(selectedDate);
    });

    function fetchMoonPhase(date) {
        const [year, month, day] = date.split('-');
        const timestamp = new Date(year, month - 1, day).getTime() / 1000;

        fetch(`https://api.farmsense.net/v1/moonphases/?d=${timestamp}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const phase = data[0].Phase;
                    moonPhaseResult.textContent = `The moon phase on ${date} is: ${phase}`;
                } else {
                    moonPhaseResult.textContent = 'No data available for the selected date.';
                }
            })
            .catch(error => {
                console.error('Error fetching moon phase data:', error);
                moonPhaseResult.textContent = 'Error fetching moon phase data.';
            });
    }

    // Fetch moon phase for today's date on initial load
    fetchMoonPhase(today);
});
