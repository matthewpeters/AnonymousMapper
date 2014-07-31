<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Admin.aspx.cs" Inherits="Admin" %>
<!DOCTYPE html>
<form runat="server">
<div id="LoginDiv" runat="server" Visible="true">
<style>
body {
    background: #333333;
}
#LoginDiv {
    height: 35px;
    width: 220px;
    background: #9F9F9F;
    margin: 0 auto 0 auto;
    border-radius: 15px;
    padding: 15px 5px 5px 15px;
    margin-top: 250px;
    box-shadow: 4px 3px 5px #000000;
}
</style>
<asp:TextBox ID="PasswordTextBox" placeholder="Password" type="password" runat="server"></asp:TextBox>
<asp:Button ID="LoginButton" runat="server" Text="Login" OnClick="LoginButton_Click" />
</div>
<div id="MainDiv" runat="server" Visible="false"><%=pageHTML %></div>
</form>