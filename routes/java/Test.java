import java.io.FileWriter;

class Animal {
    void sound() {
        System.out.println("Animal makes sound");
    }
}

class Dog extends Animal {
    void bark() {
        System.out.println("Dog barks");
    }
}

public class Test {

    public static void main(String[] args) throws Exception {

        Dog d = new Dog();
        d.sound();
        d.bark();

        FileWriter fw = new FileWriter("data.txt");
        fw.write("File Handling in Java");
        fw.close();

        System.out.println("Data written to file");
    }
}