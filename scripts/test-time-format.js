// Test time formatting functions (manual implementation for testing)
function formatTo12Hour(time24) {
  if (!time24) return ''
  if (time24.includes('AM') || time24.includes('PM')) return time24
  
  const [hoursStr, minutesStr] = time24.split(':')
  let hours = parseInt(hoursStr, 10)
  const minutes = minutesStr || '00'
  const period = hours >= 12 ? 'PM' : 'AM'
  
  if (hours === 0) hours = 12
  else if (hours > 12) hours = hours - 12
  
  return `${hours}:${minutes} ${period}`
}

function dateToTime12Hour(date) {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  
  let hours12 = hours % 12
  if (hours12 === 0) hours12 = 12
  
  const minutesStr = minutes.toString().padStart(2, '0')
  return `${hours12}:${minutesStr} ${period}`
}

function formatTo24Hour(time12) {
  if (!time12) return ''
  if (!time12.includes('AM') && !time12.includes('PM')) return time12
  
  const [timePart, period] = time12.split(' ')
  let [hours, minutes] = timePart.split(':')
  let hoursNum = parseInt(hours, 10)
  
  if (period === 'PM' && hoursNum !== 12) hoursNum += 12
  else if (period === 'AM' && hoursNum === 12) hoursNum = 0
  
  return `${hoursNum.toString().padStart(2, '0')}:${minutes}`
}

console.log('🧪 TESTING TIME FORMAT UTILITIES\n');
console.log('='.repeat(70));

// Test formatTo12Hour
console.log('\n📊 Test 1: Convert 24-hour to 12-hour');
const test24HourInputs = ['09:30', '13:00', '16:00', '00:00', '12:00', '23:59'];

test24HourInputs.forEach(time24 => {
  const time12 = formatTo12Hour(time24);
  console.log(`   ${time24} → ${time12}`);
});

// Test dateToTime12Hour
console.log('\n📊 Test 2: Convert Date object to 12-hour');
const testDates = [
  new Date('2025-10-11T09:30:00'),
  new Date('2025-10-11T13:00:00'),
  new Date('2025-10-11T16:00:00'),
  new Date('2025-10-11T00:00:00'),
  new Date('2025-10-11T12:00:00')
];

testDates.forEach(date => {
  const time12 = dateToTime12Hour(date);
  console.log(`   ${date.toISOString().split('T')[1].substring(0, 5)} → ${time12}`);
});

// Test formatTo24Hour
console.log('\n📊 Test 3: Convert 12-hour to 24-hour');
const test12HourInputs = ['9:30 AM', '1:00 PM', '4:00 PM', '12:00 AM', '12:00 PM'];

test12HourInputs.forEach(time12 => {
  const time24 = formatTo24Hour(time12);
  console.log(`   ${time12} → ${time24}`);
});

console.log('\n' + '='.repeat(70));
console.log('\n✅ Expected Results:');
console.log('   API returns: "9:30 AM", "1:00 PM", "4:00 PM"');
console.log('   Display shows: "9:30 AM", "1:00 PM", "4:00 PM"');
console.log('   No military time visible to users');

console.log('\n🎯 Time Format Standard:');
console.log('   Input: Browser native (varies by locale)');
console.log('   Storage: 24-hour format in database (ISO standard)');
console.log('   Display: 12-hour format in UI (user-friendly)');
console.log('   API: 12-hour format (consistent with UI)');

