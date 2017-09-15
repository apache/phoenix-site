# Cursor

Inorder to be able work on a subset of the rows in a query, Phoenix provides support for CURSOR control structure. The following sequence shows how to use cursor.  

1. Define cursor for a query using DECLARE statement 

    ```
    PreparedStatement statement = conn.prepareStatement("DECLARE empCursor CURSOR FOR SELECT * FROM EMP_TABLE");
    statement.execute(); 
    ```

2. Open the cursor

    ```
    statement = con.prepareStatement("OPEN empCursor");
    statement.execute();
    ```

3. Fetch subset of rows to work with

    ```
    statement = con.prepareStatement("FETCH NEXT 10 ROWS FROM empCursor"); 
    ResultSet rset = statement.execute();
    ```

4. Iterate through the subset of rows and process them as required

    ```
    while (rset.next != null){
      ...
    }
    ``` 

5. Fetch additional set of rows to process and finally close the cursor when done

    ```
    statement = con.prepareStatement(“CLOSE empCursor");
    statement.execute();
    ```
