import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from django_files.settings import MAIL_SENDER_USER, MAIL_SENDER_PASSWORD

def send_mail(mail_content, mail_subject, mail_to):
    sender_address = MAIL_SENDER_USER
    sender_pass = MAIL_SENDER_PASSWORD
    receiver_address = mail_to
    message = MIMEMultipart()
    message['From'] = sender_address
    message['To'] = receiver_address
    message['Subject'] = mail_subject
    message.attach(MIMEText(mail_content, 'html'))
    session = smtplib.SMTP('smtp.gmail.com', 587) #use gmail with port
    session.starttls() #enable security
    session.login(sender_address, sender_pass) #login with mail_id and password
    text = message.as_string()
    session.sendmail(sender_address, receiver_address, text)
    session.quit()
