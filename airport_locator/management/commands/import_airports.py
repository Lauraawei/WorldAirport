import csv
import os
from django.core.management.base import BaseCommand
from airport_locator.models import Airport
from django.contrib.gis.geos import Point
from django.conf import settings  # Import settings to access BASE_DIR

class Command(BaseCommand):
    help = 'Import airports data from Airports-Only.csv'

    def handle(self, *args, **kwargs):
        # Construct the file path using BASE_DIR
        file_path = os.path.join(settings.BASE_DIR, 'Airports-Only.csv')  # Adjust the subdirectory if necessary

        try:
            # Open the CSV file
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    try:
                        # Check the length of each field
                        if len(row['Name']) > 255:
                            self.stdout.write(self.style.ERROR(f"Name too long: {row['Name']}"))
                            continue
                        if len(row['City']) > 255:
                            self.stdout.write(self.style.ERROR(f"City too long: {row['City']}"))
                            continue
                        if len(row['Country']) > 255:
                            self.stdout.write(self.style.ERROR(f"Country too long: {row['Country']}"))
                            continue
                        
                        # Extract latitude and longitude and create Point object
                        latitude = float(row['Latitude'])
                        longitude = float(row['Longitude'])
                        location = Point(longitude, latitude)  # Note: longitude comes first

                        # Create and save the Airport instance
                        airport, created = Airport.objects.get_or_create(
                            name=row['Name'],
                            city=row['City'],
                            country=row['Country'],
                            location=location
                        )
                        if created:
                            self.stdout.write(self.style.SUCCESS(f'Airport {airport.name} added successfully'))
                        else:
                            self.stdout.write(self.style.WARNING(f'Airport {airport.name} already exists'))

                    except ValueError as ve:
                        self.stdout.write(self.style.ERROR(f"ValueError for row {row}: {ve}"))
                    except KeyError as ke:
                        self.stdout.write(self.style.ERROR(f"KeyError for row {row}: {ke}"))

            self.stdout.write(self.style.SUCCESS('Data import completed!'))

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {e}"))
