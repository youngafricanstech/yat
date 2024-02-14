from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request
import os.path
import sys
from datetime import datetime

first = "2023-11-17"
email = "info@youngafricanstech.org"
if len(sys.argv) >= 3:
    # Index 1 and 2 exist
    # Access the values at index 1 and 2
    value_at_index_1 = sys.argv[1]
    value_at_index_2 = sys.argv[2]
    first = str(sys.argv[2])
    email = str(sys.argv[1])

# first = str(sys.argv[2])
# first = "2023-11-17"
SCOPES = ['https://www.googleapis.com/auth/calendar']


email_message = """
Registration Confirmation and Calendar Invitation for Yat Online Coding Class

We sincerely appreciate your registration for the Yat online coding class.

**Action Required:**
To confirm your attendance, we kindly request you to click "Yes" on the calendar invitation that has been sent to your email.

**Important Note:**
Your prompt presence at the meeting is imperative. The session is scheduled to commence at 7:00 PM South Africa Time. Please be advised that late arrivals may regrettably not be accommodated.

Should you have any inquiries or require further assistance, please do not hesitate to contact us at +27849614744.

We extend our gratitude for your commitment and look forward to a productive session with you.

Best regards,
Young Africans Technology
"""


def check_existing_event(service, email, start_date):
    events_result = service.events().list(
        calendarId='primary',
        timeMin=start_date + 'T00:00:00Z',
        timeMax=start_date + 'T23:59:59Z',
        singleEvents=True,
        orderBy='startTime',
    ).execute()

    events = events_result.get('items', [])

    if events:
        existing_event_id = events[0]['id']
        invite_to_existing_event(service, email, existing_event_id)
    else:
        create_event(service, email, email_message, start_date)


def invite_to_existing_event(service, email, event_id):
    event = service.events().get(calendarId='primary', eventId=event_id).execute()

    if 'attendees' not in event:
        event['attendees'] = []

    event['attendees'].append({'email': email})

    updated_event = service.events().update(
        calendarId='primary',
        eventId=event_id,
        body=event,
    ).execute()

    print_meeting_details(updated_event)


def create_event(service, email, email_message, start_date):
    event = {
        'summary': 'Yat Interview/Assessment',
        'location': 'Online',
        'description': email_message,
        'start': {
            'dateTime': start_date + 'T19:00:00',
            'timeZone': 'Africa/Johannesburg',
        },
        'end': {
            'dateTime': start_date + 'T20:00:00',
            'timeZone': 'Africa/Johannesburg',
        },
        'attendees': [{'email': email}],
        'reminders': {
            'useDefault': False,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10},
            ],
        },
        'conferenceData': {
            'createRequest': {
                'requestId': 'random-string',  # Replace with a unique string
            },
        },
    }

    created_event = service.events().insert(
        calendarId='primary',
        body=event,
        conferenceDataVersion=1,
    ).execute()

    print_meeting_details(created_event)


def print_meeting_details(event):
    summary = event.get('summary', 'No Summary')
    start_time = event.get('start', {}).get('dateTime', 'No Start Time')
    end_time = event.get('end', {}).get('dateTime', 'No End Time')

    timezone = event.get('start', {}).get('timeZone', 'No Timezone')
    hangout_link = event.get('hangoutLink', 'No Hangout Link')
    phone_numbers = [entry.get('uri', '') for entry in event.get('conferenceData', {}).get(
        'entryPoints', []) if entry.get('entryPointType') == 'phone']

    teleconference_info = event.get('conferenceData', {})

    entry_points = teleconference_info.get('entryPoints', [])

    if entry_points:
        # Filter entry points for phone type
        phone_entry_points = [entry for entry in entry_points if entry.get(
            'entryPointType') == 'phone']

        if phone_entry_points:
            # Assuming the first phone entry point contains the PIN
            pin = phone_entry_points[0].get('pin', '')
        else:
            pin = ''

    else:
        pin = ''

# Now you can use 'pin' in your print statement

    start_time = event.get('start', {}).get('dateTime', 'No Start Time')
    end_time = event.get('end', {}).get('dateTime', 'No End Time')

    try:
        start_datetime = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S%z")
        end_datetime = datetime.strptime(end_time, "%Y-%m-%dT%H:%M:%S%z")

        formatted_time_range = (
            start_datetime.strftime("%A, %B %d · %I:%M") +
            " – " +
            end_datetime.strftime("%I:%M%p")
        )

    except ValueError as e:
        formatted_time_range = f"Error: {e}"

    phone_numbers_str = '\n'.join([f'  {number}' for number in phone_numbers])
    # print(f"{summary}\n"
    #       f"{formatted_start_time}\n"
    #       f"Time zone: {timezone}\n"
    #       f"Google Meet joining info\n"
    #       f"Video call link: {hangout_link}\n"
    #       f"Or dial:\n"
    #       f"{phone_numbers_str} PIN: {pin}\n"
    #       f"More phone numbers: https://tel.meet/{hangout_link}?pin={pin}")
    meeting_details = {
        "summary": summary,
        "formatted_start_time": formatted_time_range,

        "timezone": timezone,
        "hangout_link": hangout_link,
        "phone_numbers_str": phone_numbers_str,
        "pin": pin
    }

    # Read the HTML template
    with open("output.html", "r") as file:
        html_template = file.read()

    # Format the HTML template with the meeting details
    formatted_html = html_template.format(**meeting_details)

    # Print or save the formatted HTML content
    print(formatted_html)


def main():
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json")

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_config(
                client_config={
                    "web": {
                        "client_id": os.getenv("CLIENT_ID"),
                        "project_id": os.getenv("PROJECT_ID"),
                        "auth_uri": os.getenv("AUTH_URI"),
                        "token_uri": os.getenv("TOKEN_URI"),
                        "auth_provider_x509_cert_url": os.getenv("AUTH_PROVIDER_CERT_URL"),
                        "client_secret": os.getenv("CLIENT_SECRET"),
                        "redirect_uris": [os.getenv("REDIRECT_URIS")],
                    }
                },
                scopes=SCOPES
            )
            creds = flow.run_local_server(port=0)

        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    try:
        service = build('calendar', 'v3', credentials=creds)

        # Specify the email address for invitation

        # Check if an event with the same date exists
        check_existing_event(service, email, first)

    except HttpError as error:
        print('An error occurred: %s' % error)


if __name__ == '__main__':
    main()
