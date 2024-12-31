
import csv
from datetime import datetime
from src.trello_manager import TrelloManager

class Reporting:
    def __init__(self):
        self.trello = TrelloManager()

    def generate_report(self, board, format="pdf"):
    if format == "pdf":
        return self._generate_pdf_report(board)
    return self._export_to_csv(board)

def _generate_pdf_report(self, board):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
    
    filename = f"report_{datetime.now().strftime('%Y%m%d')}.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []
    
    data = [["Card Name", "List", "Due Date", "Labels", "Members"]]
    for lst in board.open_lists():
        for card in lst.list_cards():
            labels = ", ".join(label.name for label in card.labels)
            members = ", ".join(member.full_name for member in card.member_ids)
            data.append([card.name, lst.name, card.due_date, labels, members])
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)
    return filename

def _export_to_csv(self, board, filename="report.csv"):
        with open(filename, mode="w", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(["Card Name", "List", "Due Date", "Labels", "Members"])

            for lst in board.open_lists():
                for card in lst.list_cards():
                    labels = ", ".join(label.name for label in card.labels)
                    members = ", ".join(member.full_name for member in card.member_ids)
                    writer.writerow([card.name, lst.name, card.due_date, labels, members])
        print(f"Report exported to {filename}")
