import java.util.Scanner;
public class Main{
    public static void main(String[] args) {
        // Create a Scanner object to read input
        Scanner scanner = new Scanner(System.in);

        // Taking multiple inputs from the user
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();

        System.out.print("Enter your age: ");
        int age = scanner.nextInt();

        scanner.nextLine();  // Consume the newline left-over

        System.out.print("Enter your city: ");
        String city = scanner.nextLine();

        // Displaying the inputs
        System.out.println("\nUser Details:");
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("City: " + city);

        // Close the scanner
        scanner.close();
    }
}
