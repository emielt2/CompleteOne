public class aSingleton {
    private static aSingleton ourInstance = new aSingleton();

    public static aSingleton getInstance() {
        return ourInstance;
    }

    private aSingleton() {
    }
}
