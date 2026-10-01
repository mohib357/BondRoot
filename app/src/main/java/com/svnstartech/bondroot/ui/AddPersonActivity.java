package com.svnstartech.bondroot.ui;

import android.content.Context;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.google.android.material.button.MaterialButton;
import com.svnstartech.bondroot.R;
import com.svnstartech.bondroot.model.Person;
import com.svnstartech.bondroot.repository.PersonRepository;
import com.svnstartech.bondroot.util.LanguageManager;

import java.util.ArrayList;
import java.util.List;

public class AddPersonActivity extends AppCompatActivity {

    private EditText etNameLocal, etNameEnglish, etDob, etProfession;
    private Spinner spinnerGender, spinnerFather, spinnerMother;
    private MaterialButton btnSavePerson;

    private PersonRepository repository;
    private List<Person> allPersons;
    private List<Person> malePersons;
    private List<Person> femalePersons;

    @Override
    protected void attachBaseContext(Context newBase) {
        super.attachBaseContext(LanguageManager.applyLocale(newBase));
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_person);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle(getString(R.string.title_add_person));
            toolbar.setNavigationOnClickListener(v -> finish());
        }

        repository = PersonRepository.getInstance(this);
        allPersons = repository.getAllPersons();

        etNameLocal = findViewById(R.id.etNameLocal);
        etNameEnglish = findViewById(R.id.etNameEnglish);
        etDob = findViewById(R.id.etDob);
        etProfession = findViewById(R.id.etProfession);
        spinnerGender = findViewById(R.id.spinnerGender);
        spinnerFather = findViewById(R.id.spinnerFather);
        spinnerMother = findViewById(R.id.spinnerMother);
        btnSavePerson = findViewById(R.id.btnSavePerson);

        btnSavePerson.setText(getString(R.string.btn_save_person));

        setupSpinners();

        btnSavePerson.setOnClickListener(v -> savePerson());
    }

    private void setupSpinners() {
        boolean isEnglish = LanguageManager.isEnglish(this);

        // Gender
        String[] genderLabels = isEnglish ?
                new String[]{"Male", "Female", "Other"} :
                new String[]{"male (পুরুষ)", "female (নারী)", "other (অন্যান্য)"};
        ArrayAdapter<String> genderAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, genderLabels);
        spinnerGender.setAdapter(genderAdapter);

        // Father options
        malePersons = new ArrayList<>();
        List<String> fatherNames = new ArrayList<>();
        fatherNames.add(getString(R.string.none_or_unknown));

        // Mother options
        femalePersons = new ArrayList<>();
        List<String> motherNames = new ArrayList<>();
        motherNames.add(getString(R.string.none_or_unknown));

        for (Person p : allPersons) {
            String display = p.getDisplayName(isEnglish) + " [" + p.getPersonId() + "]";
            if (p.isMale()) {
                malePersons.add(p);
                fatherNames.add(display);
            } else if (p.isFemale()) {
                femalePersons.add(p);
                motherNames.add(display);
            } else {
                malePersons.add(p);
                femalePersons.add(p);
                fatherNames.add(display);
                motherNames.add(display);
            }
        }

        ArrayAdapter<String> fatherAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, fatherNames);
        spinnerFather.setAdapter(fatherAdapter);

        ArrayAdapter<String> motherAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, motherNames);
        spinnerMother.setAdapter(motherAdapter);
    }

    private void savePerson() {
        String localName = etNameLocal.getText().toString().trim();
        String englishName = etNameEnglish.getText().toString().trim();
        String dob = etDob.getText().toString().trim();
        String profession = etProfession.getText().toString().trim();
        boolean isEnglish = LanguageManager.isEnglish(this);

        if (localName.isEmpty() && englishName.isEmpty()) {
            etNameLocal.setError(isEnglish ? "Name is required" : "নাম লিখুন");
            return;
        }

        String gender = spinnerGender.getSelectedItemPosition() == 1 ? "female" : "male";

        String fatherId = null;
        int fatherPos = spinnerFather.getSelectedItemPosition();
        if (fatherPos > 0 && fatherPos - 1 < malePersons.size()) {
            fatherId = malePersons.get(fatherPos - 1).getPersonId();
        }

        String motherId = null;
        int motherPos = spinnerMother.getSelectedItemPosition();
        if (motherPos > 0 && motherPos - 1 < femalePersons.size()) {
            motherId = femalePersons.get(motherPos - 1).getPersonId();
        }

        Person p = new Person();
        p.setNameLocal(!localName.isEmpty() ? localName : englishName);
        p.setNameEnglish(!englishName.isEmpty() ? englishName : localName);
        p.setGender(gender);
        p.setDateOfBirth(dob);
        p.setProfession(profession);
        p.setFatherId(fatherId);
        p.setMotherId(motherId);

        boolean success = repository.insertPerson(p);
        if (success) {
            String msg = isEnglish ?
                    ("Person added successfully! ID: " + p.getPersonId()) :
                    ("সদস্য সফলভাবে যুক্ত হয়েছেন! Person ID: " + p.getPersonId());
            Toast.makeText(this, msg, Toast.LENGTH_LONG).show();
            finish();
        } else {
            Toast.makeText(this, isEnglish ? "Save failed" : "সংরক্ষণ ব্যর্থ হয়েছে।", Toast.LENGTH_SHORT).show();
        }
    }
}
